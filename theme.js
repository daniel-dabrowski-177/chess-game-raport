let theme = "";
let themesContainerDisplay = false;
let themesContainer = document.querySelector(".themesContainer");
let displayThemesBtn = document.getElementById("displayThemesBtn");

displayThemesBtn.addEventListener("click", () => {
  if (themesContainerDisplay) {
    themesContainer.style.display = "none";
    themesContainerDisplay = false;
  } else {
    themesContainer.style.display = "block";
    themesContainerDisplay = true;
  }
});

// Themes
// Default
let themeDefault = document.getElementById("themeDefault");
themeDefault.addEventListener("click", () => {
  theme = "";
  // declarations
  let body = document.querySelector("body");
  let button = document.querySelectorAll("button");
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  body.style.color = "#d2b48c";
  body.style.backgroundColor = "#0a2240";
  button.forEach((btn) => {
    btn.style.backgroundColor = "#0a5898";
  });

  lightSquares.forEach((ls) => {
    ls.style.backgroundColor = "";
  });
  darkSquares.forEach((ds) => {
    ds.style.backgroundColor = "";
  });
});

// Red
let themeRed = document.getElementById("themeRed");
themeRed.addEventListener("click", () => {
  theme = "red";
  // declarations
  let body = document.querySelector("body");
  let button = document.querySelectorAll("button");
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  body.style.color = "#f75c80";
  body.style.backgroundColor = "#74182e";
  button.forEach((btn) => {
    btn.style.backgroundColor = "#b63e5a";
  });

  lightSquares.forEach((ls) => {
    ls.style.backgroundColor = "#e6c8cf";
  });
  darkSquares.forEach((ds) => {
    ds.style.backgroundColor = "#e8829a";
  });
});

// Tournament
let themeTournament = document.getElementById("themeTournament");
themeTournament.addEventListener("click", () => {
  theme = "tournament";
  // declarations
  let body = document.querySelector("body");
  let button = document.querySelectorAll("button");
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  body.style.color = "#d2b48c";
  body.style.backgroundColor = "#3B3028";
  button.forEach((btn) => {
    btn.style.backgroundColor = "#168c4c";
  });

  lightSquares.forEach((ls) => {
    ls.style.backgroundColor = "#E9E9E5";
  });
  darkSquares.forEach((ds) => {
    ds.style.backgroundColor = "#316549";
  });
});

// Classic
let themeClassic = document.getElementById("themeClassic");
themeClassic.addEventListener("click", () => {
  theme = "classic";
  // declarations
  let body = document.querySelector("body");
  let button = document.querySelectorAll("button");
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  body.style.color = "#d2b48c";
  body.style.backgroundColor = "#262421";
  button.forEach((btn) => {
    btn.style.backgroundColor = "#7e5634";
  });

  lightSquares.forEach((ls) => {
    ls.style.backgroundColor = "#FCE4BE";
  });
  darkSquares.forEach((ds) => {
    ds.style.backgroundColor = "#BE8F68";
  });
});
