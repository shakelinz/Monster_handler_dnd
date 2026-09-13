
const express = require("express");
const router = express.Router();
const BL = require("../BLs/encounterBl");

// Get all monsters
router.get("/", async (req, res) => {
  const data = await BL.getAllMonsters();
  res.json(data);
});

// Get monster by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await BL.getMonsterById(id);

  if (typeof result === "string" && result.includes("not found")) {
    return res.status(404).json({ error: result });
  }

  res.json(result);
});

// Add a new monster
router.post("/", async (req, res) => {
  const monster = req.body;
  const result = await BL.saveNewMonster(monster);
  res.status(201).json({ message: result });
});

// Delete the whole encounter
router.delete("/", async (req, res) => {
  const result = await BL.deleteAllMonsters();
  res.json({ message: result });
});

// Update an existing monster
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedMonster = req.body;
  const result = await BL.updateMonster(id, updatedMonster);

  if (typeof result === "string" && result.includes(`monster with id ${id} not found`)) {
    return res.status(404).json({ error: result });
  }

  res.json({ message: result });
});

// Delete a monster
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await BL.deleteMonster(id);

  if (typeof result === "string" && result.includes("not found")) {
    return res.status(404).json({ error: result });
  }

  res.json({ message: result });
});

module.exports = router;
