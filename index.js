"use strict";

const creatures = ["kelpie", "puffskein", "salamander", "swooping", "zouwu"];
const clickSound = new Audio("media/click.wav");
const matchSound = new Audio("media/match.wav");

function fillCellWithCreature(cell, creature) {
  cell.dataset.being = creature;

  const img = document.createElement("img");
  img.src = `images/beings/${creature}.png`;
  img.alt = creature;
  img.dataset.coords = cell.dataset.coords;
  cell.appendChild(img);
}

function removeAllEventListeners() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.removeEventListener("click", handleCellClick);
  });
}

window.renderMap = function (rowsCount, colsCount) {
  const map = document.getElementById("map");

  removeAllEventListeners();

  map.style.setProperty("--rows-count", rowsCount);
  map.style.setProperty("--cols-count", colsCount);

  map.innerHTML = "";

  for (let row = 0; row < rowsCount; row += 1) {
    for (let col = 0; col < colsCount; col += 1) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.coords = `x${col}_y${row}`;
      map.appendChild(cell);
      cell.addEventListener("click", handleCellClick);
    }
  }

  window.renderCreatures();
};

window.clearMap = function () {
  const map = document.getElementById("map");
  map.innerHTML = "";
};

window.renderCreatures = function () {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const creature = creatures[Math.floor(Math.random() * creatures.length)];
    fillCellWithCreature(cell, creature);
  });
};

window.redrawMap = function (creaturesArray) {
  const rowsCount = creaturesArray.length;
  const colsCount = creaturesArray[0].length;

  if (rowsCount < 3 || colsCount < 3) return false;

  removeAllEventListeners();

  window.clearMap();
  window.renderMap(rowsCount, colsCount);

  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const row = Math.floor(index / colsCount);
    const col = index % colsCount;
    const creature = creaturesArray[row][col];
    if (creature) {
      cell.innerHTML = "";
      fillCellWithCreature(cell, creature);
    }
  });

  return true;
};

window.addEventListener("load", function () {
  window.renderMap(5, 5);

  // Limit the number of re-checks to avoid loops
  let maxAttempts = 10;
  let attempts = 0;
  let hasMatches = true;

  while (hasMatches && attempts < maxAttempts) {
    hasMatches = window.checkForMatches();
    attempts += 1;
  }

  if (attempts >= maxAttempts) {
    console.warn("Maximum number of match check attempts exceeded!");
  }
});

window.generateRandomBeingName = function () {
  return creatures[Math.floor(Math.random() * creatures.length)];
};

let firstSelectedCell = null;

function handleCellClick(event) {
  if (checkWinOrLose()) return;

  const cell = event.currentTarget;

  if (firstSelectedCell) {
    if (areNeighbors(firstSelectedCell, cell)) {
      swapCreatures(firstSelectedCell, cell);

      if (checkForMatches()) {
        moves--;
        updateStatusBar();
        matchSound
          .play()
          .catch((error) => console.warn("Error playing match sound:", error));
        if (checkWinOrLose()) return;
      } else {
        swapCreatures(firstSelectedCell, cell);
      }

      firstSelectedCell.classList.remove("selected");
      firstSelectedCell = null;
    } else {
      firstSelectedCell.classList.remove("selected");
      firstSelectedCell = null;
    }
  } else {
    firstSelectedCell = cell;
    firstSelectedCell.classList.add("selected");
    clickSound
      .play()
      .catch((error) => console.warn("Error playing click sound:", error));
  }
}

let moves = 10;
let score = 0;
const winCondition = { zouwu: 12, kelpie: 6 };
const collectedCreatures = { zouwu: 0, kelpie: 0 };

function updateStatusBar() {
  document.getElementById("moves-value").textContent = String(moves);
  document.getElementById("score-value").textContent = score;
  document.querySelector(".zouwu").textContent = String(
    winCondition.zouwu - collectedCreatures.zouwu
  );
  document.querySelector(".kelpie").textContent = String(
    winCondition.kelpie - collectedCreatures.kelpie
  );
}

function checkWinOrLose() {
  const footer = document.getElementById("game-footer");

  if (
    collectedCreatures.zouwu >= winCondition.zouwu &&
    collectedCreatures.kelpie >= winCondition.kelpie
  ) {
    footer.textContent = "You won! Reload the page to start the game again.";
    removeAllEventListeners();
    return true;
  } else if (moves <= 0) {
    footer.textContent = "You lost! Reload the page to start the game again.";
    removeAllEventListeners();
    return true;
  }
  return false;
}

function checkForMatches() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const rows = [];
  const gridCols = parseInt(
    getComputedStyle(document.getElementById("map")).getPropertyValue(
      "--cols-count"
    )
  );
  for (let i = 0; i < cells.length; i += gridCols) {
    rows.push(cells.slice(i, i + gridCols));
  }

  let hasMatch = false;
  const matches = findMatches(rows);

  if (matches.length > 0) {
    hasMatch = true;

    matches.forEach(({ row, col }) => {
      const cell = rows[row][col];
      const being = cell.dataset.being;
      if (being) {
        score += 10;
        if (being in collectedCreatures) {
          collectedCreatures[being]++;
        }
      }
      cell.dataset.being = "";
      cell.innerHTML = "";

      cell.classList.add("disappear-animation");
      cell.addEventListener(
        "animationend",
        () => {
          cell.classList.remove("disappear-animation");
          cell.dataset.being = "";
          cell.innerHTML = "";

          const creature = window.generateRandomBeingName();
          fillCellWithCreature(cell, creature);
          // Check again for matches if we filled any cells
          setTimeout(() => checkForMatches(), 800);
        },
        { once: true }
      );
    });

    matches.forEach(({ row, col }) => {
      const cell = rows[row][col];
      const creature = window.generateRandomBeingName();
      fillCellWithCreature(cell, creature);
    });

    updateStatusBar();
  }

  return hasMatch;
}

function areNeighbors(cell1, cell2) {
  const [x1, y1] = cell1.dataset.coords.slice(1).split("_y").map(Number);
  const [x2, y2] = cell2.dataset.coords.slice(1).split("_y").map(Number);

  // Checking if cells are adjacent (horizontally or vertically)
  return (
    (Math.abs(x1 - x2) === 1 && y1 === y2) ||
    (Math.abs(y1 - y2) === 1 && x1 === x2)
  );
}

function swapCreatures(cell1, cell2) {
  const tempBeing = cell1.dataset.being;
  const tempImg = cell1.querySelector("img").src;

  cell1.dataset.being = cell2.dataset.being;
  cell1.querySelector("img").src = cell2.querySelector("img").src;

  cell2.dataset.being = tempBeing;
  cell2.querySelector("img").src = tempImg;
}

function findMatches(rows) {
  let matches = [];

  rows.forEach((row, rowIndex) => {
    let matchLength = 1;

    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      const currentCell = row[colIndex];
      const nextCell = row[colIndex + 1];

      if (
        nextCell &&
        currentCell.dataset.being === nextCell.dataset.being &&
        currentCell.dataset.being
      ) {
        matchLength += 1;
      } else {
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i += 1) {
            matches.push({
              row: rowIndex,
              col: colIndex - i,
            });
          }
        }
        matchLength = 1;
      }
    }
  });

  for (let colIndex = 0; colIndex < rows[0].length; colIndex += 1) {
    let matchLength = 1;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const currentCell = rows[rowIndex][colIndex];
      const nextCell = rows[rowIndex + 1] ? rows[rowIndex + 1][colIndex] : null;

      if (
        nextCell &&
        currentCell.dataset.being === nextCell.dataset.being &&
        currentCell.dataset.being
      ) {
        matchLength += 1;
      } else {
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i += 1) {
            matches.push({
              row: rowIndex - i,
              col: colIndex,
            });
          }
        }
        matchLength = 1;
      }
    }
  }

  return matches;
}
