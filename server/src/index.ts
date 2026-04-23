import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import passport from "passport";
import path from "path";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

import { authRouter } from "./routes/auth.routes.js";
import { issuesRouter } from "./routes/issues.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { attachSocket } from "./services/socket.js";

const app = express();
const server = http.createServer(app);

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return true; // non-browser clients (curl/postman) or same-origin
  if (origin === env.CLIENT_URL) return true;

  // Dev convenience: Next can auto-bump ports (3000 -> 3001, etc).
  if (env.NODE_ENV !== "production") {
    try {
      const url = new URL(origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
    } catch {
      // ignore invalid Origin
    }
  }

  return false;
}

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    credentials: true
  }
});

attachSocket(io);

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Local upload fallback path (only used when Cloudinary isn't configured)
app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOADS_DIR)));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

await prisma.$connect();

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.PORT}`);
});

