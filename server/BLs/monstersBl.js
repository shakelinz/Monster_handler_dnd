const path = require("path");
const localPath = path.join(__dirname, "../data/monsters.json");
const DL = require("../DLs/jsonFileDl.js");

const getAllMonsters = async () => {
  try {
    const monsters = await DL.readData(localPath);
    return monsters;
  } catch (error) {
    return error.message;
  }
};

const getMonsterById = async (id) => {
  const monsters = await DL.readData(localPath);
  const monster = monsters.find((monster) => monster.id == id);
  if (!monster) {
    return `monster with id ${id} not found`;
  }
  return monster;
};

const getMonsterByName = async (name) => {
  const monsters = await DL.readData(localPath);
  const monster = monsters.find((monster) => monster.name.toLowerCase() == name.toLowerCase());
  if (!monster) {
    return `monster with name ${name} not found`;
  }
  return monster;
};

const saveNewMonster = async (monster) => {
  const monsters = await DL.readData(localPath);
  const newId = monsters.length > 0
    ? parseInt(monsters[monsters.length - 1].id) + 1
    : 1;

  monster.id = newId;
  monsters.push(monster);
  await DL.saveData(localPath, monsters);
  return "monster added successfully";
};

const updateMonster = async (id, updatedMonster) => {
  const monsters = await DL.readData(localPath);
  const index = monsters.findIndex((monster) => monster.id == id);
  if (index === -1) {
    return `monster with id ${id} not found`;
  }
  monsters[index] = { ...monsters[index], ...updatedMonster };

  await DL.saveData(localPath, monsters);
  return "monster updated successfully";
};

const deleteMonster = async (id) => {
  const monsters = await DL.readData(localPath);
  const index = monsters.findIndex((monster) => monster.id == id);
  if (index === -1) {
    return `monster with id ${id} not found`;
  }
  monsters.splice(index, 1);
  await DL.saveData(localPath, monsters);
  return "monster deleted successfully";
};

module.exports = {
  getAllMonsters,
  getMonsterById,
  getMonsterByName,
  saveNewMonster,
  updateMonster,
  deleteMonster,
};
