import express from "express";
import mongoose from "mongoose";
import path from "path";
import { DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import welcomeRoutes from "./routes/api";
import cors from "cors";
import { HTTP_STATUS } from "./utils/constants";

const APP_PORT = process.env.APP_PORT || 8080;

// App Config
const app = express();

// Middleware
global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(welcomeRoutes);
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));
app.use(errorHandler);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "X-Requested-Width");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

// DB Config
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

mongoose.set("debug", true);

app.use("*", (req, res) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: "API Endpoint Doesn't Exist",
  });
});

// App Listener
app.listen(APP_PORT, () => {
  console.log(`Listening on port ${APP_PORT}`);
});
