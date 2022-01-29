require("dotenv").config();
// async errors
require("express-async-errors");

const express = require("express");
const app = express();
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");
const path = require("path");

app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// routes
app.get("/", (req, res) => {
  res.send('<h1>Home page</h1><a href="/api/v1/products">products route</a>');
});

// product routes
app.use("/api/v1/products", productsRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (err) {
    console.log(err);
  }
};

start();
