let theme;

window.addEventListener("load", (event) => {
  theme = localStorage.getItem("theme");

  if (theme == null) {
    localStorage.setItem("theme", "default");
    localStorage.setItem("piecesSet", "neowood");
    location.reload();
  }

  switch (theme) {
    case "glass":
      themeGlass.click();
      break;
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

let pieceGlass = document.getElementById("pieceGlass");
pieceGlass.addEventListener("click", () => {
  localStorage.setItem("piecesSet", "glass");
  location.reload();
});

// Themes
// Default
let themeDefault = document.getElementById("themeDefault");
themeDefault.addEventListener("click", () => {
  theme = "default";
  localStorage.setItem("theme", "default");
  // declarations
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  lightSquares.forEach((ls) => {
    ls.style.background = "";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "";
  });
});

// Red
let themeRed = document.getElementById("themeRed");
themeRed.addEventListener("click", () => {
  theme = "red";
  localStorage.setItem("theme", "red");
  // declarations
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  lightSquares.forEach((ls) => {
    ls.style.background = "#e6c8cf";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "#e8829a";
  });
});

// Tournament
let themeTournament = document.getElementById("themeTournament");
themeTournament.addEventListener("click", () => {
  theme = "tournament";
  localStorage.setItem("theme", "tournament");

  // declarations
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  lightSquares.forEach((ls) => {
    ls.style.background = "#cee9cc";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "#7db37e";
  });
});

// Classic
let themeClassic = document.getElementById("themeClassic");
themeClassic.addEventListener("click", () => {
  theme = "classic";
  localStorage.setItem("theme", "classic");

  // declarations
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  lightSquares.forEach((ls) => {
    ls.style.background = "#FCE4BE";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "#BE8F68";
  });
});

// Glass
let themeGlass = document.getElementById("themeGlass");
themeGlass.addEventListener("click", () => {
  theme = "glass";
  localStorage.setItem("theme", "glass");

  // declarations
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");

  // styles
  lightSquares.forEach((ls) => {
    ls.style.background = "#F0F1F0";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "#C4D8E4";
  });
});