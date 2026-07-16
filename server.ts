import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import { initDb, getStore, saveStore, hashPassword, verifyPassword, sanitizePhoneNumber } from "./server/store.js";
import authRouter from "./server/routes/auth.js";

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const JWT_SECRET = process.env.JWT_SECRET || "sun8_ultra_secure_secret_2026";

app.use(express.json());

// WebSocket Logic
wss.on("connection", (ws: WebSocket) => {
  console.log("[Sun8 WS] Client connected");
  
  ws.on("message", (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log("[Sun8 WS] Message received:", message);
      
      // Broadcast to all clients (including sender for simplicity in this demo)
      const broadcastData = JSON.stringify(message);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastData);
        }
      });
    } catch (e) {
      console.error("[Sun8 WS] Error parsing message:", e);
    }
  });

  ws.on("close", () => console.log("[Sun8 WS] Client disconnected"));
});

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: string };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRouter);

app.get("/api/messages", authenticateToken, (req, res) => {
  const store = getStore();
  res.json(store.threads);
});

// Vite Middleware
async function startServer() {
  await initDb();

  const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sun8] Server running on port ${PORT}`);
  });
}

startServer();
