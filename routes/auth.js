const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient();
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const password_digest = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { firstName, lastName, email, password_digest }, })

  res.json({ message: "User created successfully!! ", user: { id: user.id, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User: ", user)
  if (!user || !(await bcrypt.compare(password, user.password_digest))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1hr" });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

  res.json({ accessToken, refreshToken, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
})

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(403).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ userId: decoded.userId, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;