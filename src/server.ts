import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Local Import
import { PORT } from "./utils/constants";
import { AppDataSource } from "./db/data-source";
import authRouter from "./routes/auth.routes";
import blockchainRouter from "./routes/events.routes";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Web socket set up
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);



app.use(helmet());
app.use(morgan("dev"));


// API ENDPOINTS

app.use("/auth", authRouter);
app.use("/blockchain", blockchainRouter);

// connect DB and start server
AppDataSource.initialize()
  .then(async () => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
