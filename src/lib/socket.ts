import { io, Socket } from 'socket.io-client';

export type SocketComment = {
  id: string;
  userId: string;
  text: string;
  date: string;
  version: number;
};

export type PresenceUser = {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  viewingFileId: string | null;
  lastSeen: number;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

let socketInstance: Socket | null = null;

function socketsDisabled() {
  return import.meta.env.VITE_DISABLE_SOCKET === 'true';
}

function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  const adminMatch = document.cookie.match(/(?:^|;\s*)admin_auth_token=([^;]+)/);
  if (adminMatch) return decodeURIComponent(adminMatch[1]);
  return null;
}

export function getSocket(): Socket | null {
  if (socketsDisabled()) return null;

  if (socketInstance?.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  const token = getAuthToken();
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

  socketInstance = io(apiBase || undefined, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: Boolean(token),
    auth: token ? { token } : {},
    withCredentials: true,
  });

  return socketInstance;
}

export function connectSocket(token?: string): Socket | null {
  const socket = getSocket();
  if (!socket) return null;
  if (token) {
    socket.auth = { token };
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function joinFilePresence(fileId: string): void {
  const socket = getSocket();
  if (!socket) return;
  if (socket.connected) {
    socket.emit('presence:join', fileId);
  } else {
    socket.once('connect', () => socket.emit('presence:join', fileId));
  }
}

export function leaveFilePresence(): void {
  const socket = getSocket();
  if (!socket?.connected) return;
  socket.emit('presence:leave');
}

export function emitComment(
  fileId: string,
  text: string,
  version?: number
): Promise<{
  ok: boolean;
  error?: string;
  comment?: SocketComment;
  comments?: SocketComment[];
  version?: number;
  serverVersion?: number;
}> {
  return new Promise((resolve) => {
    const socket = getSocket();
    if (!socket?.connected) {
      resolve({ ok: false, error: 'Not connected' });
      return;
    }

    socket.emit('comment:add', { fileId, text, version }, (response: {
      ok: boolean;
      error?: string;
      comment?: SocketComment;
      comments?: SocketComment[];
      version?: number;
      serverVersion?: number;
    }) => resolve(response));
  });
}
