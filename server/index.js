import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/route.js";

dotenv.config();

const app = express();
const allowedOrigins = ["https://gyaan-buddy-psi.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Mount API routes
app.use(router);

const PORT = process.env.PORT || 5000;

// Health check
app.get("/", (req, res) => {
  return res.send("i am node js container");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
