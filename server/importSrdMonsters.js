const fs = require("fs");
const path = require("path");

const apiUrl = "https://api.open5e.com/v1/monsters/?document__slug=wotc-srd&limit=100";
const monstersPath = path.join(__dirname, "data/monsters.json");

const toText = (value) => value == null ? "" : String(value);

const normalizeMonster = (monster, id) => ({
  id: String(id),
  name: monster.name,
  currentName: "",
  size: monster.size,
  type: monster.subtype ? `${monster.type} (${monster.subtype})` : monster.type,
  alignment: monster.alignment,
  ac: toText(monster.armor_class),
  hp: toText(monster.hit_points),
  speed: Object.entries(monster.speed || {})
    .map(([kind, feet]) => `${kind} ${feet} ft.`)
    .join(", "),
  stats: {
    str: toText(monster.strength),
    dex: toText(monster.dexterity),
    con: toText(monster.constitution),
    int: toText(monster.intelligence),
    wis: toText(monster.wisdom),
    cha: toText(monster.charisma),
  },
  savingThrows: Object.fromEntries(
    [["str", monster.strength_save], ["dex", monster.dexterity_save], ["con", monster.constitution_save],
      ["int", monster.intelligence_save], ["wis", monster.wisdom_save], ["cha", monster.charisma_save]]
      .filter(([, value]) => value != null)
      .map(([ability, value]) => [ability, toText(value)])
  ),
  skills: Object.fromEntries(
    Object.entries(monster.skills || {}).map(([skill, value]) => [skill, toText(value)])
  ),
  damageResistances: monster.damage_resistances || "",
  damageImmunities: monster.damage_immunities || "",
  damageVulnerabilities: monster.damage_vulnerabilities || "",
  conditionImmunities: monster.condition_immunities || "",
  senses: monster.senses || "",
  passivePerception: toText(monster.perception),
  languages: monster.languages || "",
  cr: toText(monster.challenge_rating || monster.cr),
  abilities: (monster.special_abilities || []).map(({ name, desc }) => ({ name, description: desc })),
  actions: (monster.actions || []).map(({ name, desc }) => ({ name, description: desc })),
  currentHP: toText(monster.hit_points),
  img: (monster.img_main || "").replace(/^http:/, "https:"),
  comments: "",
});

const fetchAllMonsters = async () => {
  const monsters = [];
  let url = apiUrl;

  while (url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SRD API request failed: ${response.status}`);
    }
    const page = await response.json();
    monsters.push(...page.results);
    url = page.next;
  }

  return monsters;
};

const main = async () => {
  const existingMonsters = JSON.parse(fs.readFileSync(monstersPath, "utf8"));
  const existingByName = new Map(
    existingMonsters.map((monster) => [monster.name.toLowerCase(), monster])
  );
  const srdMonsters = await fetchAllMonsters();
  const imported = srdMonsters.map((monster, index) => {
    const normalized = normalizeMonster(monster, index + 1);
    const existing = existingByName.get(normalized.name.toLowerCase());
    return existing ? { ...normalized, ...existing, id: String(existing.id) } : normalized;
  });

  fs.writeFileSync(monstersPath, `${JSON.stringify(imported, null, 4)}\n`);
  console.log(`Imported ${imported.length} SRD monsters into ${monstersPath}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});