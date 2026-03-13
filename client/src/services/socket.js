let socket = null;

export function initSocket() {
  return socket;
}

export function disconnectSocket() {
  socket = null;
}

export { socket };
