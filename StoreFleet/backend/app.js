import express from "express";
import dotenv from "dotenv";
import path from "path";
import productRoutes from "./src/product/routes/product.routes.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import userRoutes from "./src/user/routes/user.routes.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./src/order/routes/order.routes.js";

// Keep the starter project's configuration location for compatibility.
dotenv.config({ path: path.resolve("backend", "config", "uat.env") });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/storefleet/product", productRoutes);
app.use("/api/storefleet/user", userRoutes);
app.use("/api/storefleet/order", orderRoutes);
app.use(errorHandlerMiddleware);

export default app;
