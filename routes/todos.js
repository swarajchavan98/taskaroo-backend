const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// Get all todos of a user
router.get("/", async (req, res) => {
  console.log("REceived hereee!")
  const userId = req.user.id;

  try {
    const todos = await prisma.todo.findMany({
      where: { created_by: userId },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add a new todo
router.post("/", async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const todo = await prisma.todo.create({
      data: {
        content,
        created_by: userId,
      },
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update a todo
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;
  const userId = req.user.id;

  try {
    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo || todo.created_by !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { isCompleted },
    });

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Remove a todo
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo || todo.created_by !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.todo.delete({ where: { id } });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = router;