import express from "express";
import { PORT } from "./utils/constants";
import { AppDataSource } from "./db/database";
import authRouter from "./routes/auth.routes";


const app = express();
app.use(express.json());
app.use("/auth", authRouter);

// connect DB and start server 
AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
