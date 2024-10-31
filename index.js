const creatures = ["kelpie", "puffskein", "salamander", "swooping", "zouwu"];

function fillCellWithCreature(cell, creature) {
  cell.dataset.being = creature;

  const img = document.createElement("img");
  img.src = `images/beings/${creature}.png`;
  img.alt = creature;
  img.dataset.coords = cell.dataset.coords;
  cell.appendChild(img);
}

window.renderMap = function (rowsCount, colsCount) {
  const map = document.getElementById("map");

  map.style.setProperty("--rows-count", rowsCount);
  map.style.setProperty("--cols-count", colsCount);

  map.innerHTML = "";

  for (let row = 0; row < rowsCount; row += 1) {
    for (let col = 0; col < colsCount; col += 1) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.coords = `x${col}_y${row}`;
      map.appendChild(cell);
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
});
