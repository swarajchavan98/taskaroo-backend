const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");
const logger = require('./logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(requestLogger)

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
