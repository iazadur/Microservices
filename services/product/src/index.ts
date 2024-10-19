import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createProduct, getProductDetails, getProducts } from "./controllers";

// Import the default export correctly

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use((_req, res, next) => {
  const allowOrigins = ["http://127.0.0.1:8081", "http://localhost:8081"];
  const origin = _req.headers.origin || "";
  if (allowOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

// routes
app.get("/products/:id", getProductDetails);
app.get("/products", getProducts);
app.post("/products", createProduct);


app.use((_req, res) => {
  res.status(404).send("404 - Not Found");
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

const port = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || "Product-Service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
