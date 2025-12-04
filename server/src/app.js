import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";


import authRoutes from "./routes/auth-routes.js";


import errorHandler from "./middleware/error-handler.js";


const app = express();
const PORT = process.env.PORT || 1234;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);


app.use(errorHandler);

app.get("/", (_req, res) => {
  res.json({
    message: "PlatformOne API",
    version: "1.0.0",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
