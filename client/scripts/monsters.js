// add monster modal functionality
const addMonsterModal = document.getElementById("addMonsterModal");
addMonsterModal.addEventListener("show.bs.modal", function (event) {
  // Update the modal's content
  const modalBody = addMonsterModal.querySelector(".modal-body");

  modalBody.innerHTML = `
    <input id="monsterName" type="text" class="form-control mb-2" placeholder="Monster Name">
    <input id="monsterMaxHP" type="number" class="form-control mb-2" placeholder="Max HP">
    <input id="monsterAC" type="number" class="form-control mb-2" placeholder="Armor Class">
    <input id="monsterCurrentHP" type="number" class="form-control mb-2" placeholder="Current HP">
    <input id="monsterType" type="text" class="form-control mb-2" placeholder="Type">
    <input id="monsterSize" type="text" class="form-control mb-2" placeholder="Size">
    <input id="monsterAlignment" type="text" class="form-control mb-2" placeholder="Alignment">
    <input id="monsterCR" type="text" class="form-control mb-2" placeholder="Challenge Rating">
    <input id="monsterSpeed" type="text" class="form-control mb-2" placeholder="Speed">
    <input id="monsterStats" type="text" class="form-control mb-2" placeholder="Stats (JSON)">
    <input id="monsterSavingThrows" type="text" class="form-control mb-2" placeholder="Saving Throws (JSON)">
    <input id="monsterSkills" type="text" class="form-control mb-2" placeholder="Skills (JSON)">
    <input id="monsterDamageResistances" type="text" class="form-control mb-2" placeholder="Damage Resistances">
    <input id="monsterDamageImmunities" type="text" class="form-control mb-2" placeholder="Damage Immunities">
    <input id="monsterDamageVulnerabilities" type="text" class="form-control mb-2" placeholder="Damage Vulnerabilities">
    <input id="monsterConditionImmunities" type="text" class="form-control mb-2" placeholder="Condition Immunities">
    <input id="monsterSenses" type="text" class="form-control mb-2" placeholder="Senses">  
    <input id="monsterPassivePerception" type="text" class="form-control mb-2" placeholder="Passive Perception">
    <input id="monsterLanguages" type="text" class="form-control mb-2" placeholder="Languages">
    <textarea id="monsterActions" class="form-control mb-2" placeholder="Actions (JSON)"></textarea>
    <textarea id="monsterAbilities" class="form-control mb-2" placeholder="Abilities (JSON)"></textarea>
    <input id="monsterImg" type="text" class="form-control mb-2" placeholder="Image URL">
    
    <button class="btn btn-primary" id="saveMonsterBtn">Save Monster</button>

  `;

  // Add event listener to the save button
  const saveMonsterBtn = modalBody.querySelector("#saveMonsterBtn");
  saveMonsterBtn.addEventListener("click", async () => {
    const newMonster = {
      name: document.getElementById("monsterName").value,
      hp: parseInt(document.getElementById("monsterMaxHP").value),
      ac: parseInt(document.getElementById("monsterAC").value),
      currentHP: parseInt(document.getElementById("monsterCurrentHP").value),
      type: document.getElementById("monsterType").value,
      size: document.getElementById("monsterSize").value,
      alignment: document.getElementById("monsterAlignment").value,
      cr: document.getElementById("monsterCR").value,
      speed: document.getElementById("monsterSpeed").value,
      stats: JSON.parse(document.getElementById("monsterStats").value || "{}"),
      savingThrows: JSON.parse(document.getElementById("monsterSavingThrows").value || "{}"),
      skills: JSON.parse(document.getElementById("monsterSkills").value || "{}"),
      damageResistances: document.getElementById("monsterDamageResistances").value,
      damageImmunities: document.getElementById("monsterDamageImmunities").value,
      damageVulnerabilities: document.getElementById("monsterDamageVulnerabilities").value,
      conditionImmunities: document.getElementById("monsterConditionImmunities").value,
      senses: document.getElementById("monsterSenses").value,
      passivePerception: document.getElementById("monsterPassivePerception").value,
      languages: document.getElementById("monsterLanguages").value,
      actions: JSON.parse(document.getElementById("monsterActions").value || "[]"),
      abilities: JSON.parse(document.getElementById("monsterAbilities").value || "[]"),
      img: document.getElementById("monsterImg").value,
    };

    // Send the new monster to the server
    await fetch(`http://127.0.0.1:3000/api/monsters/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMonster),
    });
  });
});

// get api request
let monstersData = await fetch("http://127.0.0.1:3000/api/monsters/")
  .then(async (response) => {
    const data = await response.json();
    if (!response.ok || !Array.isArray(data)) {
      throw new Error(typeof data === "string" ? data : "Invalid monsters response");
    }
    return data;
  })
  .catch((error) => {
    console.error("Error fetching monsters:", error);
    return [];
  });

const monstersArray = monstersData;

// Display monsters in an accordion format
const monsterAccordion = document.getElementById("monsterAccordion");
monsterAccordion.innerHTML = "";
monstersArray.forEach((monster) => {
  const safeId = monster.id || monster.encounterId || Math.random().toString(36).substr(2, 9);
  const safeImg = monster.img && monster.img.trim() !== "" ? monster.img : "https://placehold.co";
  const safeCR = monster.cr || monster.challengeRating || "1/4";
  const monsterCard = document.createElement("div");
  //   accordion closed by default
  monsterCard.classList.add("accordion-item");
  monsterCard.innerHTML = `
    <h2 class="accordion-header" id="heading-${monster.id}">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${monster.id
    }" aria-expanded="false" aria-controls="collapse-${monster.id}">
        ${monster.name} (${monster.size} ${monster.type})
      </button>
    </h2>
    <div id="collapse-${monster.id
    }" class="accordion-collapse collapse" aria-labelledby="heading-${monster.id
    }" data-bs-parent="#monsterAccordion">
      <div class="accordion-body">
      <img src="${monster.img}" alt="${monster.name}" class="img-fluid">
        <p><strong>Alignment:</strong> ${monster.alignment}</p>
        <p><strong>Armor Class:</strong> ${monster.ac}</p>
        <p><strong>Hit Points:</strong> ${monster.hp}</p>
        <p><strong>Speed:</strong> ${monster.speed}</p>
        <p><strong>Challenge Rating:</strong> ${monster.cr}</p>
        <strong>Alignment:</strong> ${monster.alignment} <br>
    <strong>speed:</strong> ${monster.speed} <br>
    <strong>stats:</strong> ${JSON.stringify(monster.stats)} <br>
    <strong>Saving Throws:</strong> ${monster.savingThrows ? JSON.stringify(monster.savingThrows) : "None"
    } <br>
    <strong>Skills:</strong> ${monster.skills ? JSON.stringify(monster.skills) : "None"
    } <br>
    <strong>Damage Resistances:</strong> ${monster.damageResistances || "None"
    } <br>
    <strong>Damage Immunities:</strong> ${monster.damageImmunities || "None"
    } <br>
    <strong>Damage Vulnerabilities:</strong> ${monster.damageVulnerabilities || "None"
    } <br>
    <strong>Condition Immunities:</strong> ${monster.conditionImmunities || "None"
    } <br>
    <strong>Senses:</strong> ${monster.senses || "None"} <br>
    <strong>Passive Perception:</strong> ${monster.passivePerception || "None"
    } <br>
    <strong>Languages:</strong> ${monster.languages || "None"} <br>
    <strong>Actions:</strong> ${monster.actions
      ? monster.actions
        .map((action) => `<div>${action.name}: ${action.description}</div>`)
        .join("")
      : "None"
    } <br>
    <strong>Abilities:</strong> ${monster.abilities
      ? monster.abilities
        .map(
          (ability) => `<div>${ability.name}: ${ability.description}</div>`
        )
        .join("")
      : "None"
    } <br>

        <button class="btn btn-secondary edit-monster-btn" data-monster-id="${monster.id
    }">Edit</button>
        <button class="btn btn-danger delete-monster-btn" data-monster-id="${monster.id
    }">Delete</button>
      </div>
    </div>`;
  monsterAccordion.appendChild(monsterCard);
});

// Add event listener to the modal for editing monsters
const editMonsterModal = document.getElementById("editMonsterModal");

monsterAccordion.addEventListener("click", async (event) => {
  if (event.target.classList.contains("edit-monster-btn")) {
    const monsterId = event.target.dataset.monsterId;

    const monster = monsters.find((m) => m.id == monsterId);
    if (monster) {
      const modalBody = editMonsterModal.querySelector("#edit-monster-details");
      modalBody.innerHTML = ``;
      modalBody.innerHTML += `
        <input id="editMonsterName" type="text" class="form-control mb-2" value="${monster.name ?? "Unknown Monster"
        }" placeholder="Monster Name">
        <input id="editMonsterMaxHP" type="number" class="form-control mb-2" value="${monster.hp ?? "0"
        }" placeholder="Max HP">
        <input id="editMonsterAC" type="number" class="form-control mb-2" value="${monster.ac ?? "10"
        }" placeholder="Armor Class">
        <input id="editMonsterCurrentHP" type="number" class="form-control mb-2" value="${monster.currentHP ?? "0"
        }" placeholder="Current HP">
        <input id="editMonsterType" type="text" class="form-control mb-2" value="${monster.type ?? "Unknown Type"
        }" placeholder="Type">
        <input id="editMonsterSize" type="text" class="form-control mb-2" value="${monster.size ?? "Medium"
        }" placeholder="Size">
        <input id="editMonsterAlignment" type="text" class="form-control mb-2" value="${monster.alignment ?? "Neutral"
        }" placeholder="Alignment">
        <input id="editMonsterCR" type="text" class="form-control mb-2" value="${monster.challengeRating ?? "1/4"
        }" placeholder="Challenge Rating">
        <input id="editMonsterSpeed" type="text" class="form-control mb-2" value="${monster.speed ?? "30 ft"
        }" placeholder="Speed">
        <input id="editMonsterStats" type="text" class="form-control mb-2" value='${JSON.stringify(
          monster.stats || {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,
          }
        )}' placeholder='Stats (JSON)'>
        <input id="editMonsterSavingThrows" type="text" class="form-control mb-2" value='${JSON.stringify(
          monster.savingThrows || {}
        )}' placeholder='Saving Throws (JSON)'>
        <input id="editMonsterSkills" type="text" class="form-control mb-2" value='${JSON.stringify(
          monster.skills || {}
        )}' placeholder='Skills (JSON)'>
        <input id="editMonsterDamageResistances" type="text" class="form-control mb-2" value="${monster.damageResistances || ""
        }" placeholder='Damage Resistances'>
        <input id="editMonsterDamageImmunities" type="text" class="form-control mb-2" value="${monster.damageImmunities || ""
        }" placeholder='Damage Immunities'>
        <input id="editMonsterDamageVulnerabilities" type="text" class="form-control mb-2" value="${monster.damageVulnerabilities || ""
        }" placeholder='Damage Vulnerabilities'>
        <input id="editMonsterConditionImmunities" type="text" class="form-control mb-2" value="${monster.conditionImmunities || ""
        }" placeholder='Condition Immunities'>
        <input id="editMonsterSenses" type="text" class="form-control mb-2" value="${monster.senses || ""
        }" placeholder='Senses'>
        <input id="editMonsterPassivePerception" type="text" class="form-control mb-2" value="${monster.passivePerception || ""
        }" placeholder='Passive Perception'>
        <input id="editMonsterLanguages" type="text" class="form-control mb-2" value="${monster.languages || ""
        }" placeholder='Languages'>
        <textarea id="editMonsterActions" class="form-control mb-2" placeholder='Actions (JSON)'>${monster.actions ? JSON.stringify(monster.actions) : ""
        }</textarea>
        <textarea id="editMonsterAbilities" class="form-control mb-2" placeholder='Abilities (JSON)'>${monster.abilities ? JSON.stringify(monster.abilities) : ""
        }</textarea>
        <input id="editMonsterImg" type="text" class="form-control mb-2" value="${monster.img || ""
        }" placeholder='Image URL'>
        <button class="btn btn-primary" id="saveEditedMonsterBtn">Save Changes</button>
        
      `;
      // Show the modal
      const bootstrapModal = new bootstrap.Modal(editMonsterModal);
      bootstrapModal.show();

      // Important: use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const saveEditedMonsterBtn = document.getElementById(
          "saveEditedMonsterBtn"
        );
        saveEditedMonsterBtn.addEventListener("click", async () => {
          // Get updated values from the modal
          const updatedMonster = {
            id: monster.id,
            name: document.getElementById("editMonsterName").value,
            hp: parseInt(
              document.getElementById("editMonsterMaxHP").value
            ),
            ac: parseInt(
              document.getElementById("editMonsterAC").value
            ),
            currentHP: parseInt(
              document.getElementById("editMonsterCurrentHP").value
            ),
            type: document.getElementById("editMonsterType").value,
            size: document.getElementById("editMonsterSize").value,
            alignment: document.getElementById("editMonsterAlignment").value,
            challengeRating: document.getElementById("editMonsterCR").value,
            speed: document.getElementById("editMonsterSpeed").value,
            stats: JSON.parse(
              document.getElementById("editMonsterStats").value
            ),
            savingThrows: JSON.parse(
              document.getElementById("editMonsterSavingThrows").value
            ),
            skills: JSON.parse(
              document.getElementById("editMonsterSkills").value
            ),
            damageResistances: document.getElementById(
              "editMonsterDamageResistances"
            ).value,
            damageImmunities: document.getElementById(
              "editMonsterDamageImmunities"
            ).value,
            damageVulnerabilities: document.getElementById(
              "editMonsterDamageVulnerabilities"
            ).value,
            conditionImmunities: document.getElementById(
              "editMonsterConditionImmunities"
            ).value,
            senses: document.getElementById("editMonsterSenses").value,
            passivePerception: document.getElementById(
              "editMonsterPassivePerception"
            ).value,
            languages: document.getElementById("editMonsterLanguages").value,
            actions: JSON.parse(
              document.getElementById("editMonsterActions").value
            ),
            abilities: JSON.parse(
              document.getElementById("editMonsterAbilities").value
            ),
            img: document.getElementById("editMonsterImg").value,
          };

          // update the monster in monsters.json using fetch API

          await fetch(`http://127.0.0.1:3000/api/monsters/${monster.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMonster),
          });


          // Close the modal
          bootstrapModal.hide();
        });
      }, 0);
    }
  } else if (event.target.classList.contains("delete-monster-btn")) {
    const monsterId = event.target.dataset.monsterId;
    if (!confirm(`Are you sure you want to delete monster with ID ${monsterId}?`)) {
      return;
    }
    await fetch(`http://127.0.0.1:3000/api/monsters/${monsterId}`, {
      method: "DELETE",
    });
    window.location.reload(); // Reload the page to reflect changes
  }
});
