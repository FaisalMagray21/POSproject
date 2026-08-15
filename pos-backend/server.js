const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Dynamic CORS: koi bhi po-sproject*.vercel.app URL + localhost allow karega
app.use(cors({
  origin: function (origin, callback) {
    // Postman/curl jaise tools origin nahi bhejte
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,                    // koi bhi localhost port
      /^https:\/\/po-sproject.*\.vercel\.app$/,       // koi bhi po-sproject* Vercel URL
    ];

    const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Static file serving for uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "POS Backend API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
