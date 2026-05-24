import { useCallback, useContext, useEffect, useState } from 'react';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinFilePresence,
  leaveFilePresence,
  emitComment,
  type PresenceUser,
  type SocketComment,
  type AppNotification,
} from '../lib/socket';
import { AuthContext } from '../contexts/AuthContext';
import { invalidateClientWorkspace } from '../lib/cache-strategy';

export function useRealtimeConnection(enabled = true) {
  const { user } = useContext(AuthContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !user) {
      disconnectSocket();
      setConnected(false);
      return;
    }

    const socket = connectSocket();
    if (!socket) {
      setConnected(false);
      return;
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [enabled, user?.id]);

  return { connected, socket: getSocket() };
}

export function useFilePresence(fileId: string | null) {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const { connected } = useRealtimeConnection(Boolean(fileId));

  useEffect(() => {
    if (!fileId || !connected) {
      setViewers([]);
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    joinFilePresence(fileId);

    const onPresence = (payload: { fileId: string; users: PresenceUser[] }) => {
      if (payload.fileId === fileId) {
        setViewers(payload.users);
      }
    };

    socket.on('presence:update', onPresence);

    return () => {
      socket.off('presence:update', onPresence);
      leaveFilePresence();
      setViewers([]);
    };
  }, [fileId, connected]);

  return viewers;
}

export function useRealtimeComments(
  fileId: string | null,
  initialComments: SocketComment[],
  onCommentsChange: (comments: SocketComment[]) => void
) {
  const { connected } = useRealtimeConnection(Boolean(fileId));

  useEffect(() => {
    if (!fileId || !connected) return;

    const socket = getSocket();
    if (!socket) return;

    const onNewComment = (payload: {
      fileId: string;
      comments: SocketComment[];
    }) => {
      if (payload.fileId === fileId && Array.isArray(payload.comments)) {
        onCommentsChange(payload.comments);
      }
    };

    const onFileUpdated = (payload: { fileId: string; comments?: SocketComment[] }) => {
      if (payload.fileId === fileId && payload.comments) {
        onCommentsChange(payload.comments);
      }
    };

    socket.on('comment:new', onNewComment);
    socket.on('file:updated', onFileUpdated);

    return () => {
      socket.off('comment:new', onNewComment);
      socket.off('file:updated', onFileUpdated);
    };
  }, [fileId, connected, onCommentsChange]);

  const addComment = useCallback(
    async (text: string, version?: number) => {
      if (!fileId) return { ok: false as const, error: 'No file' };
      const result = await emitComment(fileId, text, version);
      if (result.ok && result.comments) {
        onCommentsChange(result.comments);
        invalidateClientWorkspace();
      }
      return result;
    },
    [fileId, onCommentsChange]
  );

  return { addComment, connected };
}

export function useRealtimeNotifications(
  onNotification?: (notification: AppNotification) => void
) {
  const { user } = useContext(AuthContext);
  const { connected } = useRealtimeConnection(Boolean(user));

  useEffect(() => {
    if (!user || !connected) return;

    const socket = getSocket();
    if (!socket) return;

    const handler = (payload: AppNotification) => {
      onNotification?.(payload);
    };
    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [user?.id, connected, onNotification]);
}
