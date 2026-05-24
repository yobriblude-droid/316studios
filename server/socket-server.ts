import type { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

type Comment = {
  id: string;
  userId: string;
  text: string;
  date: string;
  version: number;
};

type ClientFile = {
  id: string;
  userId: string;
  name: string;
  comments: Comment[];
  approved: boolean | null;
};

type DbApi = {
  getUserById: (id: string) => { id: string; email: string; name: string; role: string } | undefined;
  getUserByEmail: (email: string) => { id: string; email: string; name: string; role: string } | undefined;
  getClientFileById: (id: string, userId: string) => ClientFile | undefined;
  getClientFileByIdOnly: (id: string) => ClientFile | undefined;
  updateClientFile: (
    id: string,
    userId: string,
    updates: { comments?: Comment[]; approved?: boolean }
  ) => unknown;
  createNotification: (n: {
    userId: string;
    type: 'comment' | 'approval' | 'request' | 'invoice' | 'booking' | 'mention' | 'system';
    title: string;
    body: string;
    link?: string | null;
    metadata?: Record<string, unknown> | null;
  }) => {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    read: number;
    link: string | null;
    metadata: string | null;
    createdAt: string;
  };
  getAdmins: () => Array<{ id: string; email: string; name: string; role: string }>;
  getNotificationPreferences: (userId: string) => {
    commentAlerts: number;
    approvalAlerts: number;
    requestAlerts: number;
    mentionAlerts: number;
    pushEnabled: number;
  };
};

type AuthPayload = { id: string; email: string; role?: string };

type PresenceUser = {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  viewingFileId: string | null;
  lastSeen: number;
};

export type SocketServerApi = {
  io: Server;
  emitToUser: (userId: string, event: string, payload: unknown) => void;
  emitFileUpdate: (fileId: string, payload: unknown) => void;
  notifyUser: (
    userId: string,
    notification: {
      userId: string;
      type: 'comment' | 'approval' | 'request' | 'invoice' | 'booking' | 'mention' | 'system';
      title: string;
      body: string;
      link?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  ) => void;
  getPresenceForFile: (fileId: string) => PresenceUser[];
};

const presenceByFile = new Map<string, Map<string, PresenceUser>>();
const socketToUser = new Map<string, { userId: string; role: string }>();

function parseMentions(text: string): string[] {
  const matches = text.match(/@([^\s@]+)/g) || [];
  return matches.map((m) => m.slice(1).toLowerCase());
}

function resolveFile(db: DbApi, fileId: string, user: { id: string; role: string }): ClientFile | null {
  if (user.role === 'admin') {
    return db.getClientFileByIdOnly(fileId) || null;
  }
  return db.getClientFileById(fileId, user.id) || null;
}

export function attachSocketServer(
  httpServer: HttpServer,
  db: DbApi,
  jwtSecret: string
): SocketServerApi {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const emitToUser = (userId: string, event: string, payload: unknown) => {
    for (const [socketId, meta] of socketToUser.entries()) {
      if (meta.userId === userId) {
        io.to(socketId).emit(event, payload);
      }
    }
  };

  const emitFileUpdate = (fileId: string, payload: unknown) => {
    io.to(`file:${fileId}`).emit('file:updated', payload);
  };

  const notifyUser = (
    userId: string,
    notification: {
      userId: string;
      type: 'comment' | 'approval' | 'request' | 'invoice' | 'booking' | 'mention' | 'system';
      title: string;
      body: string;
      link?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  ) => {
    const prefs = db.getNotificationPreferences(userId);
    if (!prefs.pushEnabled) return;
    const row = db.createNotification(notification);
    emitToUser(userId, 'notification:new', {
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      body: row.body,
      read: false,
      link: row.link,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row.createdAt,
    });
  };

  const getPresenceForFile = (fileId: string): PresenceUser[] => {
    const room = presenceByFile.get(fileId);
    if (!room) return [];
    return Array.from(room.values());
  };

  const broadcastPresence = (fileId: string) => {
    io.to(`file:${fileId}`).emit('presence:update', {
      fileId,
      users: getPresenceForFile(fileId),
    });
  };

  const updatePresence = (socket: Socket, fileId: string | null) => {
    const meta = socketToUser.get(socket.id);
    if (!meta) return;
    const user = db.getUserById(meta.userId);
    if (!user) return;

    for (const [, room] of presenceByFile) {
      const had = room.delete(socket.id);
      if (had) {
        const fid = [...presenceByFile.entries()].find(([, r]) => r === room)?.[0];
        if (fid) broadcastPresence(fid);
      }
    }

    if (fileId) {
      if (!presenceByFile.has(fileId)) {
        presenceByFile.set(fileId, new Map());
      }
      const room = presenceByFile.get(fileId)!;
      room.set(socket.id, {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        role: user.role,
        viewingFileId: fileId,
        lastSeen: Date.now(),
      });
      socket.join(`file:${fileId}`);
      broadcastPresence(fileId);
    }
  };

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers.authorization as string)?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        return next(new Error('Invalid token'));
      }
      const payload = decoded as AuthPayload;
      const user = db.getUserById(payload.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.data.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      next();
    });
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as { id: string; email: string; name: string; role: string };
    socketToUser.set(socket.id, { userId: user.id, role: user.role });
    socket.join(`user:${user.id}`);
    if (user.role === 'admin') {
      socket.join('admins');
    }

    socket.emit('connected', { userId: user.id, name: user.name, role: user.role });

    socket.on('presence:join', (fileId: string) => {
      if (typeof fileId === 'string' && fileId.length > 0) {
        updatePresence(socket, fileId);
      }
    });

    socket.on('presence:leave', () => {
      updatePresence(socket, null);
    });

    socket.on(
      'comment:add',
      (
        payload: { fileId: string; text: string; version?: number },
        ack?: (res: {
          ok: boolean;
          error?: string;
          comment?: Comment;
          comments?: Comment[];
          version?: number;
          serverVersion?: number;
        }) => void
      ) => {
        const { fileId, text, version } = payload || {};
        if (!fileId || typeof text !== 'string' || text.trim().length < 1 || text.length > 1000) {
          ack?.({ ok: false, error: 'Invalid comment' });
          return;
        }

        const targetFile = resolveFile(db, fileId, user);
        if (!targetFile) {
          ack?.({ ok: false, error: 'File not found' });
          return;
        }

        const comments: Comment[] = Array.isArray(targetFile.comments)
          ? targetFile.comments.map((c) => ({
              id: c.id,
              userId: c.userId,
              text: c.text,
              date: c.date,
              version: c.version || 0,
            }))
          : [];

        const serverVersion =
          comments.length > 0 ? Math.max(...comments.map((c) => c.version)) : 0;

        if (version !== undefined && version < serverVersion) {
          ack?.({
            ok: false,
            error: 'conflict',
            serverVersion,
            comments,
          });
          return;
        }

        const comment: Comment = {
          id: randomUUID(),
          userId: user.id,
          text: text.trim(),
          date: new Date().toISOString(),
          version: serverVersion + 1,
        };

        const updatedComments = [...comments, comment];
        db.updateClientFile(fileId, targetFile.userId, { comments: updatedComments });

        const eventPayload = {
          fileId,
          comment,
          comments: updatedComments,
          author: { id: user.id, name: user.name },
        };

        io.to(`file:${fileId}`).emit('comment:new', eventPayload);
        emitFileUpdate(fileId, { fileId, comments: updatedComments, approved: targetFile.approved });

        const mentionTokens = parseMentions(text);
        for (const token of mentionTokens) {
          const byEmail = db.getUserByEmail(token.includes('@') ? token : `${token}@example.com`);
          if (byEmail && byEmail.id !== user.id) {
            const prefs = db.getNotificationPreferences(byEmail.id);
            if (prefs.mentionAlerts) {
              notifyUser(byEmail.id, {
                userId: byEmail.id,
                type: 'mention',
                title: `${user.name} mentioned you`,
                body: text.trim().slice(0, 120),
                link: '/dashboard',
                metadata: { fileId, commentId: comment.id },
              });
            }
          }
        }

        if (user.role === 'client') {
          for (const admin of db.getAdmins()) {
            const prefs = db.getNotificationPreferences(admin.id);
            if (prefs.commentAlerts) {
              notifyUser(admin.id, {
                userId: admin.id,
                type: 'comment',
                title: `Comment on ${targetFile.name}`,
                body: `${user.name}: ${text.trim().slice(0, 80)}`,
                link: `/admin/users/${targetFile.userId}/media`,
                metadata: { fileId, commentId: comment.id },
              });
            }
          }
        } else if (targetFile.userId !== user.id) {
          const prefs = db.getNotificationPreferences(targetFile.userId);
          if (prefs.commentAlerts) {
            notifyUser(targetFile.userId, {
              userId: targetFile.userId,
              type: 'comment',
              title: `Studio commented on ${targetFile.name}`,
              body: text.trim().slice(0, 120),
              link: '/dashboard',
              metadata: { fileId, commentId: comment.id },
            });
          }
        }

        ack?.({ ok: true, comment, comments: updatedComments, version: comment.version });
      }
    );

    socket.on('disconnect', () => {
      socketToUser.delete(socket.id);
      for (const [fileId, room] of presenceByFile) {
        if (room.delete(socket.id)) {
          broadcastPresence(fileId);
        }
      }
    });
  });

  return { io, emitToUser, emitFileUpdate, notifyUser, getPresenceForFile };
}
