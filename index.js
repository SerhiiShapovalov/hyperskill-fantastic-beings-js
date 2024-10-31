window.renderMap = function (rowsCount, colsCount) {
  const map = document.getElementById("map");

  map.style.setProperty("--rows-count", rowsCount);
  map.style.setProperty("--cols-count", colsCount);

  map.innerHTML = "";

  for (let row = 0; row < rowsCount; row++) {
    for (let col = 0; col < colsCount; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      map.appendChild(cell);
    }
  }
};

window.clearMap = function () {
  const map = document.getElementById("map");
  map.innerHTML = "";
};

window.addEventListener("load", function () {
  window.renderMap(5, 5);
});
