// search functionality
const searchInput = document.getElementById("search-input");
const suggestionsList = document.getElementById("suggestions-list");
// Sample data for suggestions
searchInput.addEventListener("input", async function () {
  const query = this.value.toLowerCase();
  suggestionsList.innerHTML = ""; // Clear previous suggestions

  if (query.length === 0) {
    return; // No suggestions if input is empty
  }
  let originMonsters = await fetch("http://127.0.0.1:3000/api/monsters/").then(
    (response) => response.json()
  );

  // FIX: Fallback to an object property if it's nested (e.g., originMonsters.monsters), or use an empty array if undefined
  const monstersArray = Array.isArray(originMonsters)
    ? originMonsters
    : (originMonsters.monsters || Object.values(originMonsters));

  let monsterNames = monstersArray.map((monster) => monster.name);

  const filteredSuggestions = monsterNames.filter((item) =>
    item.toLowerCase().startsWith(query)
  );

  filteredSuggestions.forEach((suggestion) => {
    const listItem = document.createElement("li");
    listItem.textContent = suggestion;
    listItem.addEventListener("click", function () {
      searchInput.value = this.textContent;
      suggestionsList.innerHTML = ""; // Clear suggestions after selection
    });
    suggestionsList.appendChild(listItem);
  });
});
// Close suggestions when clicking outside the search bar
document.addEventListener("click", function (event) {
  if (!event.target.closest(".search-container")) {
    suggestionsList.innerHTML = "";
  }
});
// Add a click event listener to the add button
const addMonsterBtn = document.getElementById("add-button");
addMonsterBtn.addEventListener("click", async function () {
  // add a monster form monster.json to encounter.json
  const monsterName = searchInput.value.trim();
  const monster = await fetch(
    `http://127.0.0.1:3000/api/monsters/name/${monsterName}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Monster not found");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching monster:", error);
      alert("Monster not found. Please check the name and try again.");
      return null;
    });
  if (monster) {
    // Add the monsters to the encounter.json
    const monsterNum = document.getElementById("monster-count").value;
    if (monsterNum == "Number of monsters") {
      alert("Please select the number of monsters to add.");
      return;
    }
    let encounterMonsters = await fetch(
      "http://127.0.0.1:3000/api/encounter/"
    ).then((response) => response.json());
    let lastMonster = encounterMonsters.findLast(currMonster => currMonster.name.includes(monster.name));
    let counter = 0;
    if (lastMonster) {
      counter = parseInt(lastMonster.name.slice(monster.name.length));
      counter++;
    }
    for (let i = 0; i < monsterNum; i++) {
      // Clone the monster object to avoid modifying the original
      const monsterClone = { ...monster, name: (monster.name + counter.toString()) };
      // Reset currentHP to max HP
      monsterClone.currentHP = monsterClone.hp;
      // Add the monster to the encounter
      await fetch("http://127.0.0.1:3000/api/encounter/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monsterClone),
      });
      counter++;
    }
    location.reload();
  }
});

// Display monsters in cards
let monsterCardsContainer = document.getElementById("monster-cards"); // Clear existing content
let monstersData = await fetch("http://127.0.0.1:3000/api/encounter/")
  .then(async (response) => {
    const data = await response.json();
    if (!response.ok || !Array.isArray(data)) {
      throw new Error(typeof data === "string" ? data : "Invalid encounter response");
    }
    return data;
  })
  .catch((error) => {
    console.error("Error fetching encounter:", error);
    return [];
  });

const monstersArray = monstersData;

monstersArray.forEach((monster) => {
  let monsterCard = document.createElement("div");

  monsterCard.className = "col-md-2 mb-4";
  monsterCard.style.borderRadius = "8px"; // Rounded corners
  //   green border for monsters with HP > 0, red for those with HP <= 0
  let monsterColor = "";
  if (monster.currentHP == monster.hp) {
    monsterColor = "bg-success"; // Green background for monsters with full HP
  } else if (monster.currentHP > monster.hp / 2) {
    monsterColor = "bg-warning"; // Yellow background for monsters with more than half HP
  } else if (monster.currentHP > 0) {
    monsterColor = "bg-danger"; // Red background for monsters with less than half HP
  } else {
    monsterColor = "bg-secondary"; // Grey background for monsters with 0 HP
  }
  // the img size will be 100% of the card width and height
  monsterCard.innerHTML = `
    <div class="card ${monsterColor} h-100">
      <img src="${monster.img}" class="card-img-top" alt="${monster.name}"
       style = "width: fit-content;
       height: 5vw;
       object-fit: cover;">
       
      <div class="card-body">
        <h5 class="card-title ">monster: ${monster.name}</h5>
        <p class="card-text">max HP: ${monster.hp}</p>
        <p class="card-text">AC: ${monster.ac}</p>
        <p class="card-text">current HP: ${monster.currentHP}</p>
        <button class="btn btn-danger" id="deleteMonsterBtn${monster.encounterId}" data-monster-id="${monster.encounterId}">Delete</button>
        <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#monsterModal" data-monster-id="${monster.encounterId}">edit</a>
      </div>
    </div>
  `;
  monsterCardsContainer.appendChild(monsterCard);
  //delete functionality
  const deleteMonsterBtn = document.getElementById(
    `deleteMonsterBtn${monster.encounterId}`
  );
  deleteMonsterBtn.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default link behavior
    if (!confirm(`Are you sure you want to delete ${monster.name}`)) {
      return;
    }
    const monsterId = monster.encounterId; // Get the monster ID from the button's data attribute
    await fetch(`http://127.0.0.1:3000/api/encounter/${monsterId}`, {
      method: "DELETE",
    });
    monsterCard.remove();
  });
});

// monsters damage functionality
const selectMonstersBtn = document.getElementById("selectMonstersBtn");
const damageButton = document.getElementById("damage-button");
const selectedMonsters = new Set();
let selectionMode = false;

const selectAllBtn = document.getElementById("selectAllBtn");

selectAllBtn.addEventListener("click", function () {
  if (!selectionMode) {
    alert("Click 'Select Monsters' first to enable selection mode.");
    return;
  }

  const monsterCards = document.querySelectorAll(".card");

  let allSelected = true;
  monsterCards.forEach((card) => {
    const monsterId = card.querySelector("a").getAttribute("data-monster-id");
    if (!selectedMonsters.has(monsterId)) {
      allSelected = false;
    }
  });

  monsterCards.forEach((card) => {
    const monsterId = card.querySelector("a").getAttribute("data-monster-id");

    if (!allSelected) {
      selectedMonsters.add(monsterId);
      card.classList.add("selected");
    } else {
      selectedMonsters.delete(monsterId);
      card.classList.remove("selected");
    }
  });

  selectAllBtn.innerText = allSelected ? "Select All" : "Deselect All";
});
selectMonstersBtn.addEventListener("click", function () {
  selectionMode = !selectionMode;

  const monsterCards = document.querySelectorAll(".card");

  if (selectionMode) {
    this.innerText = "Stop selecting Monsters";
    damageButton.style.display = "block";
    selectAllBtn.style.display = "block";

    monsterCards.forEach((card) => {
      card.classList.add("selectable");
      card.addEventListener("click", handleCardSelection);
    });
    damageButton.addEventListener("click", async function () {
      if (selectedMonsters.size != 0) {
        const monsterIds = [...selectedMonsters];
        if (selectedMonsters.size === 0) {
          alert("Please select at least one monster.");
          return;
        }

        let damageAmount = document.getElementById("damage-input").value;
        const damageType = document.getElementById("damageType").value;

        if (!damageAmount || !damageType) {
          alert("Please enter a valid damage amount and type.");
          return;
        }

        for (const monsterId of monsterIds) {
          let monster = await fetch(
            `http://localhost:3000/api/encounter/${monsterId}`
          );
          monster = await monster.json();

          let finalDamage = parseInt(damageAmount);
          if (
            monster.damageImmunities &&
            monster.damageImmunities.includes(damageType)
          ) {
            finalDamage = 0;
          }

          if (
            monster.damageResistances &&
            monster.damageResistances.includes(damageType)
          ) {
            finalDamage = Math.ceil(finalDamage / 2);
          }
          if (damageType === "heal") {
            finalDamage = -finalDamage; // Heal is negative damage
            monster.currentHP = Math.min(
              monster.hp,
              monster.currentHP - finalDamage
            );
          } else {
            monster.currentHP = Math.max(0, monster.currentHP - finalDamage);
          }

          // Update the monster's current HP
          console.log(
            `Updating monster with ID: ${monsterId} with damage: ${damageAmount}`
          );
          await fetch(`http://localhost:3000/api/encounter/${monsterId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(monster),
          });
        }
      }
      this.innerText = "Select Monsters";
      damageButton.style.display = "none";
      selectAllBtn.style.display = "none";
      selectedMonsters.clear();

      monsterCards.forEach((card) => {
        card.classList.remove("selectable", "selected");
        card.removeEventListener("click", handleCardSelection);
      });
    });
  } else {
    this.innerText = "Select Monsters";
    damageButton.style.display = "none";
    selectAllBtn.style.display = "none";
    selectedMonsters.clear();

    monsterCards.forEach((card) => {
      card.classList.remove("selectable", "selected");
      card.removeEventListener("click", handleCardSelection);
    });
  }
});
function handleCardSelection(event) {
  if (!selectionMode) return;

  // Prevent clicking inner elements (like links) from bubbling up
  if (event.target.tagName === "A") return;

  const card = event.currentTarget;
  const monsterId = card.querySelector("a").getAttribute("data-monster-id");

  if (selectedMonsters.has(monsterId)) {
    selectedMonsters.delete(monsterId);
    card.classList.remove("selected");
  } else {
    selectedMonsters.add(monsterId);

    card.classList.add("selected");
  }
}

// monster edit Modal functionality
const monsterModal = document.getElementById("monsterModal");
monsterModal.addEventListener("show.bs.modal", async function (event) {
  const button = event.relatedTarget; // Button that triggered the modal
  const monsterId = button.getAttribute("data-monster-id"); // Extract info from data-* attributes

  // Find the monster by ID
  const monster = await fetch(
    `http://localhost:3000/api/encounter/${monsterId}`
  ).then((response) => response.json());

  // Update the modal's content
  const modalTitle = monsterModal.querySelector(".modal-title");
  const modalBody = monsterModal.querySelector(".modal-body");

  modalTitle.textContent = `Details for ${monster.name}`;
  modalBody.innerHTML = `
    <label for="monsterName">Monster Name:</label>
    <input id="monsterName" type="text" class="form-control mb-2" value="${monster.name
    }" placeholder="Monster Name">
    <label for="monsterMaxHP">Max HP:</label>
    <input id="monsterMaxHP" type="number" class="form-control mb-2" value="${monster.hp
    }" placeholder="Max HP">
    <label for="monsterAC">Armor Class:</label>
    <input id="monsterAC" type="number" class="form-control mb-2" value="${monster.ac
    }" placeholder="Armor Class">
    <label for="monsterCurrentHP">Current HP:</label>
    <input id="monsterCurrentHP" type="number" class="form-control mb-2" value="${monster.currentHP
    }" placeholder="Current HP">
    <label for="monsterType">Type:</label>
    <input id="monsterType" type="text" class="form-control mb-2" value="${monster.type
    }" placeholder="Type">
    <label for="monsterSize">Size:</label>
    <input id="monsterSize" type="text" class="form-control mb-2" value="${monster.size
    }" placeholder="Size">
    <label for="monsterCr">Challenge Rating:</label>
    <input id="monsterCr" type="text" class="form-control mb-2" value="${monster.cr
    }" placeholder="Challenge Rating">
    <label for="monsterAlignment">Alignment:</label>
    <input id="monsterAlignment" type="text" class="form-control mb-2" value="${monster.alignment
    }" placeholder="Alignment">
    <label for="monsterSpeed">Speed:</label>
    <input id="monsterSpeed" type="text" class="form-control mb-2" value="${monster.speed
    }" placeholder="Speed">
    <label for="monsterStats">Stats:</label>
    <input id="monsterStats" type="text" class="form-control mb-2" value='${JSON.stringify(
      monster.stats
    )}' placeholder='Stats'>
    <label for='monsterSavingThrows'>Saving Throws:</label>
    <input id='monsterSavingThrows' type='text' class='form-control mb-2' value='${monster.savingThrows ? JSON.stringify(monster.savingThrows) : ""
    }' placeholder='Saving Throws'>
    <label for='monsterSkills'>Skills:</label>
    <input id='monsterSkills' type='text' class='form-control mb-2' value='${monster.skills ? JSON.stringify(monster.skills) : ""
    }' placeholder='Skills'>
    <label for='monsterDamageResistances'>Damage Resistances:</label>
    <input id='monsterDamageResistances' type='text' class='form-control mb-2' value='${monster.damageResistances || ""
    }' placeholder='Damage Resistances'>
    <label for='monsterDamageImmunities'>Damage Immunities:</label>
    <input id='monsterDamageImmunities' type='text' class='form-control mb-2' value='${monster.damageImmunities || ""
    }' placeholder='Damage Immunities'>
    <label for='monsterDamageVulnerabilities'>Damage Vulnerabilities:</label>
    <input id='monsterDamageVulnerabilities' type='text' class='form-control mb-2' value='${monster.damageVulnerabilities || ""
    }' placeholder='Damage Vulnerabilities'>
    <label for='monsterConditionImmunities'>Condition Immunities:</label>
    <input id='monsterConditionImmunities' type='text' class='form-control mb-2' value='${monster.conditionImmunities || ""
    }' placeholder='Condition Immunities'>
    <label for='monsterSenses'>Senses:</label>
    <input id='monsterSenses' type='text' class='form-control mb-2' value='${monster.senses || ""
    }' placeholder='Senses'>
    <label for='monsterPassivePerception'>Passive Perception:</label>
    <input id='monsterPassivePerception' type='text' class='form-control mb-2' value='${monster.passivePerception || ""
    }' placeholder='Passive Perception'>
    <label for='monsterLanguages'>Languages:</label>
    <input id='monsterLanguages' type='text' class='form-control mb-2' value='${monster.languages || ""
    }' placeholder='Languages'>
    <label for='monsterActions'>Actions:</label>
    <p>
    ${monster.actions?.length
      ? monster.actions
        .map(
          (action) =>
            `<div class="mb-2"><strong>${action.name}:</strong> ${action.description}</div>`
        )
        .join("")
      : "<em>No actions available.</em>"
    }
    </p>
    <input id='monsterActions' type='text' class='form-control mb-2' value='${JSON.stringify(monster.actions) || ""
    }' placeholder='Actions'>
    <label for='monsterAbilities'>Abilities:</label>
    <p>
    ${monster.abilities?.length
      ? monster.abilities
        .map(
          (ability) =>
            `<div class="mb-2"><strong>${ability.name}:</strong> ${ability.description}</div>`
        )
        .join("")
      : "<em>No abilities available.</em>"
    }
  </p>
    <input id='monsterAbilities' type='text' class='form-control mb-2' value='${JSON.stringify(monster.abilities) || ""
    }' placeholder='Abilities'>
    <input id='monsterImg' type='text' class='form-control mb-2' value='${monster.img || ""
    }' placeholder="Image URL">
    <button class="btn btn-primary mt-3" id="editMonsterBtn">Edit Monster</button>
  `;

  // Add edit functionality
  const editMonsterBtn = document.getElementById("editMonsterBtn");
  editMonsterBtn.addEventListener("click", async function () {
    const updatedMonster = {
      id: monster.id,
      name: modalBody.querySelector("#monsterName").value,
      hp: parseInt(modalBody.querySelector("#monsterMaxHP").value),
      ac: parseInt(modalBody.querySelector("#monsterAC").value),
      currentHP: parseInt(modalBody.querySelector("#monsterCurrentHP").value),
      type: modalBody.querySelector("#monsterType").value,
      size: modalBody.querySelector("#monsterSize").value,
      alignment: modalBody.querySelector("#monsterAlignment").value,
      challengeRating: modalBody.querySelector("#monsterCr").value,
      speed: modalBody.querySelector("#monsterSpeed").value,
      stats: JSON.parse(modalBody.querySelector("#monsterStats").value),
      savingThrows: JSON.parse(
        modalBody.querySelector("#monsterSavingThrows").value
      ),
      skills: JSON.parse(modalBody.querySelector("#monsterSkills").value),
      damageResistances: modalBody.querySelector("#monsterDamageResistances")
        .value,
      damageImmunities: modalBody.querySelector("#monsterDamageImmunities")
        .value,
      damageVulnerabilities: document.getElementById(
        "monsterDamageVulnerabilities"
      ).value,
      conditionImmunities: modalBody.querySelector(
        "#monsterConditionImmunities"
      ).value,
      senses: modalBody.querySelector("#monsterSenses").value,
      passivePerception: modalBody.querySelector("#monsterPassivePerception")
        .value,
      languages: modalBody.querySelector("#monsterLanguages").value,
      actions: JSON.parse(modalBody.querySelector("#monsterActions").value),
      abilities: JSON.parse(modalBody.querySelector("#monsterAbilities").value),
      img: modalBody.querySelector("#monsterImg").value,
    };

    // Send the updated monster data to the server
    await fetch(`http://localhost:3000/api/encounter/${monster.encounterId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedMonster),
    })
      .then((response) => response.json())
      .then((data) => {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(monsterModal);
        modal.hide();
      })
      .catch((error) => {
        console.error("Error updating monster:", error);
      });
  });
});

// delete the whole encounter
document.getElementById("deleteAllBtn").addEventListener("click", async () => {
  if (!confirm(`Are you sure you want to delete the whole encounter`)) {
    return;
  }
  const response = await fetch("http://127.0.0.1:3000/api/encounter/", {
    method: "DELETE",
  });
  if (!response.ok) {
    console.error("Error deleting encounter:", await response.text());
    return;
  }
  window.location.reload();
});
