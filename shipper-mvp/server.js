const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: ".env" });

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("Next handler error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    addTrailingSlash: false,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.userId;
      socket.userEmail = payload.email;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, true);
    socket.join(`user:${userId}`);

    io.emit("users:online", Array.from(onlineUsers.keys()));

    socket.on("message:send", async (payload, callback) => {
      const { sessionId, content } = payload || {};
      if (!sessionId || typeof content !== "string" || !content.trim()) {
        callback?.({ error: "Invalid payload" });
        return;
      }
      try {
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          include: { user1: true, user2: true },
        });
        if (!session) {
          callback?.({ error: "Session not found" });
          return;
        }
        const otherId = session.user1Id === userId ? session.user2Id : session.user2Id;
        if (session.user1Id !== userId && session.user2Id !== userId) {
          callback?.({ error: "Forbidden" });
          return;
        }
        const message = await prisma.message.create({
          data: {
            sessionId,
            senderId: userId,
            content: content.trim(),
            type: "user",
          },
          include: { sender: { select: { id: true, name: true, picture: true } } },
        });
        const out = {
          id: message.id,
          sessionId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          sender: message.sender,
        };
        io.to(`user:${otherId}`).emit("message:new", out);
        callback?.({ message: out });
      } catch (err) {
        console.error("message:send error:", err);
        callback?.({ error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("users:online", Array.from(onlineUsers.keys()));
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
