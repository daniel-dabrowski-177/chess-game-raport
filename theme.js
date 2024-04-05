let theme;

window.addEventListener("load", (event) => {
  theme = localStorage.getItem("theme");

  if (theme == null) {
    localStorage.setItem("theme", "default");
    localStorage.setItem("piecesSet", "neowood");
    location.reload();
  }

  switch (theme) {
    case "red":
      themeRed.click();
      break;
    case "tournament":
      themeTournament.click();
      break;
    case "classic":
      themeClassic.click();
      break;
    default:
      "default";
      themeDefault.click();
      break;
  }
});

// Themes button
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

// Pieces button
let piecesContainerDisplay = false;
let piecesContainer = document.querySelector(".piecesContainer");
let displayPiecesBtn = document.getElementById("displayPiecesBtn");

displayPiecesBtn.addEventListener("click", () => {
  if (piecesContainerDisplay) {
    piecesContainer.style.display = "none";
    piecesContainerDisplay = false;
  } else {
    piecesContainer.style.display = "block";
    piecesContainerDisplay = true;
  }
});

// Pieces
let pieceAlpha = document.getElementById("pieceAlpha");
pieceAlpha.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "alpha");
  location.reload();
});

let pieceChess24 = document.getElementById("pieceChess24");
pieceChess24.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "chess24");
  location.reload();
});

let pieceLeipzig = document.getElementById("pieceLeipzig");
pieceLeipzig.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "leipzig");
  location.reload();
});

let pieceSymbol = document.getElementById("pieceSymbol");
pieceSymbol.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "symbol");
  location.reload();
});

let pieceUscf = document.getElementById("pieceUscf");
pieceUscf.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "uscf");
  location.reload();
});

let pieceWikipedia = document.getElementById("pieceWikipedia");
pieceWikipedia.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "wikipedia");
  location.reload();
});

let pieceBases = document.getElementById("pieceBases");
pieceBases.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "bases");
  location.reload();
});

let pieceNeo = document.getElementById("pieceNeo");
pieceNeo.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "neo");
  location.reload();
});

let pieceClassic = document.getElementById("pieceClassic");
pieceClassic.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "classic");
  location.reload();
});

let pieceNeowood = document.getElementById("pieceNeowood");
pieceNeowood.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "neowood");
  location.reload();
});

let pieceCases = document.getElementById("pieceCases");
pieceCases.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "cases");
  location.reload();
});

let pieceTournament = document.getElementById("pieceTournament");
pieceTournament.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "tournament");
  location.reload();
});

// Themes
// Default
let themeDefault = document.getElementById("themeDefault");
themeDefault.addEventListener("click", () => {
  theme = "default";
  localStorage.setItem("theme", "default");
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
  localStorage.setItem("theme", "red");
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
  localStorage.setItem("theme", "tournament");

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
  localStorage.setItem("theme", "classic");

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
