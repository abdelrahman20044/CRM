const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const app = express();
const authRouter = require("./routes/authRoutes");
const contactRouter = require("./routes/contactRoutes");
const dealRouter = require("./routes/dealRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");
const activityRouter = require("./routes/activityRoutes");
const globalErorr = require("./controllers/errorController");
const AppError = require("./utils/appError");

// CORS
app.use(cors({
  origin: true,       // allow all origins 
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors());   // handle preflight requests

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limiting requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
// Body parser
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  }),
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Route handlers

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/deals", dealRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/activities", activityRouter);


app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));

});
app.use(globalErorr);

module.exports = app;
