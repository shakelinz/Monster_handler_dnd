const path = require("path");
const localPath = path.join(__dirname, "../data/encounters/encounter0.json");
const DL = require("../DLs/jsonFileDl.js");

const getAllMonsters = async () => {
  try {
    const monsters = await DL.readData(localPath);
    return monsters;
  } catch (error) {
    return error.message;
  }
};

const getMonsterById = async (encounterId) => {
  const monsters = await DL.readData(localPath);
  const monster = monsters.find((monster) => monster.encounterId == encounterId);
  if (!monster) {
    return `monster with encounterId ${encounterId} not found`;
  }
  return monster;
};

const saveNewMonster = async (monster) => {
  const monsters = await DL.readData(localPath);

  const newId = monsters.length > 0
    ? parseInt(monsters[monsters.length - 1].encounterId) + 1
    : 1;

  monster.encounterId = newId;
  monsters.push(monster);
  await DL.saveData(localPath, monsters);

  return "monster added successfully";
};


const updateMonster = async (encounterId, updatedMonster) => {
  const monsters = await DL.readData(localPath);
  const index = monsters.findIndex((monster) => monster.encounterId == encounterId);
  if (index === -1) {
    return `monster with encounterId ${encounterId} not found`;
  }
  monsters[index] = { ...monsters[index], ...updatedMonster };

  await DL.saveData(localPath, monsters);
  return "monster updated successfully";
};

const deleteMonster = async (encounterId) => {
  const monsters = await DL.readData(localPath);
  const index = monsters.findIndex((monster) => monster.encounterId == encounterId);
  if (index === -1) {
    return `monster with encounterId ${encounterId} not found`;
  }
  monsters.splice(index, 1);
  await DL.saveData(localPath, monsters);
  return "monster deleted successfully";
};

const deleteAllMonsters = async () => {
  await DL.saveData(localPath, []);
  return "encounter deleted successfully";
};

module.exports = {
  getAllMonsters,
  getMonsterById,
  saveNewMonster,
  updateMonster,
  deleteMonster,
  deleteAllMonsters,
};
