const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Track active terminal sessions
const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const { sessionId, workingDir } = socket.handshake.query;
  const cwd = workingDir ? path.join('/workspace', workingDir) : '/workspace';

  // Spawn shell process
  const shell = process.env.SHELL || '/bin/bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: cwd,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor'
    }
  });

  // Store session
  sessions.set(socket.id, {
    ptyProcess,
    sessionId,
    createdAt: Date.now()
  });

  // Forward PTY output to client
  ptyProcess.onData((data) => {
    socket.emit('terminal.output', data);
  });

  // Handle PTY exit
  ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(`PTY exited: code=${exitCode}, signal=${signal}`);
    socket.emit('terminal.exit', { exitCode, signal });
    sessions.delete(socket.id);
  });

  // Forward client input to PTY
  socket.on('terminal.input', (data) => {
    ptyProcess.write(data);
  });

  // Handle terminal resize
  socket.on('terminal.resize', ({ cols, rows }) => {
    try {
      ptyProcess.resize(cols, rows);
    } catch (err) {
      console.error('Resize error:', err);
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const session = sessions.get(socket.id);
    if (session) {
      session.ptyProcess.kill();
      sessions.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Terminal server listening on port ${PORT}`);
  console.log(`Workspace mounted at: /workspace`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  sessions.forEach(({ ptyProcess }) => ptyProcess.kill());
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
