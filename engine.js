let game = new Chess();

let whitePlayer;
let blackPlayer;
let whiteElo;
let blackElo;
let timeControl;

let whitePlayerDiv = document.getElementById("whitePlayer");
let blackPlayerDiv = document.getElementById("blackPlayer");

function stringToMoveArray(pgnStr) {
  let [metadata, moves] = pgnStr.trim().split(/\n\n/);
  let movesArray = removeUnnecessaryLetters(moves);

  function removeUnnecessaryLetters(moves) {
    let outputString = moves
      .replace(/\$\d+/g, "")
      .replace(/\d+\.\s/g, "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\d+\./g, "")
      .replace(/\./g, "")
      .split(/\s/);

    outputString = outputString.filter((item) => item !== "");

    return outputString;
  }

  // Extract information from metadata
  function extractInfo(metadata, tag) {
    let regex = new RegExp("\\[" + tag + ' "(.*?)"\\]');
    let match = metadata.match(regex);
    return match ? match[1] : null;
  }

  // Extracting required information
  whitePlayer = extractInfo(metadata, "White");
  blackPlayer = extractInfo(metadata, "Black");
  whiteElo = extractInfo(metadata, "WhiteElo");
  blackElo = extractInfo(metadata, "BlackElo");
  timeControl = extractInfo(metadata, "TimeControl");

  if (
    timeControl == "600" ||
    timeControl == "900+10" ||
    timeControl == "1800" ||
    timeControl == "600+5" ||
    timeControl == "1200" ||
    timeControl == "3200"
  ) {
    timeControl = "⏱";
  } else if (
    timeControl == "180" ||
    timeControl == "180+1" ||
    timeControl == "180+2" ||
    timeControl == "300" ||
    timeControl == "300+5" ||
    timeControl == "300+2"
  ) {
    timeControl = "⚡";
  } else if (
    timeControl == "60" ||
    timeControl == "60+1" ||
    timeControl == "120+1" ||
    timeControl == "30" ||
    timeControl == "20+1"
  ) {
    timeControl = "🔫";
  } else if (timeControl == "1/0" || timeControl == "0/1") {
    timeControl = "🤖";
  }

  whitePlayerDiv.innerHTML = `${whitePlayer}: ${timeControl}${whiteElo}`;
  blackPlayerDiv.innerHTML = `${blackPlayer}: ${timeControl}${blackElo}`;

  return movesArray;
}

let pgn = [];
let currentPgn = [];

let piecesSet = localStorage.getItem("piecesSet");

let board = Chessboard("myBoard", {
  position: "start",
  draggable: false,
  pieceTheme: `chesspieces/${piecesSet}/{piece}.png`,
});

let isBoardFlipped = false;

let flipOrientationBtn = document.getElementById("flipOrientationBtn");
flipOrientationBtn.addEventListener("click", () => {
  board.flip();

  isBoardFlipped = !isBoardFlipped;
  removeAllPaintedSquares();

  if (showAnalise) {
    let lightSquares = document.querySelectorAll(".white-1e1d7");
    let darkSquares = document.querySelectorAll(".black-3c85d");
    lightSquares.forEach((ls) => {
      ls.style.background = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#BE8F68";
    });
  }

  if (isBoardFlipped) {
    whitePlayerDiv.innerHTML = `${blackPlayer}: ${timeControl}${blackElo}`;
    blackPlayerDiv.innerHTML = `${whitePlayer}: ${timeControl}${whiteElo}`;
  } else {
    whitePlayerDiv.innerHTML = `${whitePlayer}: ${timeControl}${whiteElo}`;
    blackPlayerDiv.innerHTML = `${blackPlayer}: ${timeControl}${blackElo}`;
  }
});

let openSettings = false;
let settingsContainer = document.querySelector(".settingsContainer");

let settingsBtn = document.getElementById("settingsBtn");
settingsBtn.addEventListener("click", () => {
  if (openSettings) {
    settingsContainer.style.display = "none";
    openSettings = false;
  } else {
    settingsContainer.style.display = "block";
    openSettings = true;
  }
});

let showEngineBestMoves = false;
let showThreats = true;
let toggleNotifications = false;
let showAnalise = false;
let bookMove = false;
let openingName;

let bestMoveAsistantBtn = document.getElementById("bestMoveAsistantBtn");
bestMoveAsistantBtn.addEventListener("click", () => {
  showEngineBestMoves = !showEngineBestMoves;
  removeAllPaintedSquares();
  paintSquares();
  if (showEngineBestMoves) {
    bestMoveAsistantBtn.textContent = `Engine Moves: yes`;
  } else {
    bestMoveAsistantBtn.textContent = `Engine Moves: no`;
  }
});

let showThreatsBtn = document.getElementById("showThreatsBtn");
showThreatsBtn.addEventListener("click", () => {
  showThreats = !showThreats;
  removeAllPaintedSquares();
  paintSquares();
  if (!showThreats) {
    showThreatsBtn.textContent = `Show Threats: no`;
  } else {
    showThreatsBtn.textContent = `Show Threats: yes`;
  }
});

// Toggle Notifications
let toggleNotificationsBtn = document.getElementById("toggleNotificationsBtn");
toggleNotificationsBtn.addEventListener("click", () => {
  toggleNotifications = !toggleNotifications;
  removeAllPaintedSquares();

  let typeOneDiv = document.querySelector(".type-one");
  let typeTwoDiv = document.querySelector(".type-two");
  if (!toggleNotifications) {
    toggleNotificationsBtn.textContent = `Toggle Notifications: yes`;
    typeOneDiv.style.visibility = "hidden";
    typeTwoDiv.style.visibility = "visible";
  } else {
    toggleNotificationsBtn.textContent = `Toggle Notifications: no`;
    typeOneDiv.style.visibility = "visible";
    typeTwoDiv.style.visibility = "hidden";
  }
});

// SearchForGames
let searchInput = document.getElementById("searchInput");
let modal = document.getElementById("myModal");
let openModalBtn = document.getElementById("openModalBtn");
let inputDate = document.querySelector(".input-date");

openModalBtn.addEventListener("click", () => {
  let searchInput = document.getElementById("searchInput");

  modal.style.display = "block";
  let username;
  let date;

  openModal();

  let currentDate = getCurrentDateYYYYMM();
  inputDate.value = currentDate;
});

async function fetchData(username, date) {
  let gamesList = document.querySelector(".games-list");
  try {
    let response = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${date}`
    );
    let data = await response.json();
    data = data.games;

    for (let i = 0; i < data.length; i++) {
      let li = document.createElement("li");

      let whiteUsername = data[i].white.username;
      let whiteRating = data[i].white.rating;
      let blackUsername = data[i].black.username;
      let blackRating = data[i].black.rating;
      let timeControl = data[i].time_control;
      let gameResult;
      // let chessComAccWhite;
      // let chessComAccBlack;

      // Game result
      if (data[i].white.result == "win") {
        gameResult = "1 - 0";
      } else if (data[i].black.result == "win") {
        gameResult = "0 - 1";
      } else {
        gameResult = "1/2 - 1/2";
      }

      // Accuracy of games
      // if (data[i].accuracies) {
      //   chessComAccWhite = data[i].accuracies.white.toFixed(1);
      //   chessComAccBlack = data[i].accuracies.black.toFixed(1);
      // }

      // Type of a game
      if (
        timeControl == "600" ||
        timeControl == "900+10" ||
        timeControl == "1800" ||
        timeControl == "600+5" ||
        timeControl == "1200" ||
        timeControl == "3200"
      ) {
        timeControl = "⏱";
      } else if (
        timeControl == "180" ||
        timeControl == "180+1" ||
        timeControl == "180+2" ||
        timeControl == "300" ||
        timeControl == "300+5" ||
        timeControl == "300+2"
      ) {
        timeControl = "⚡";
      } else if (
        timeControl == "60" ||
        timeControl == "60+1" ||
        timeControl == "120+1" ||
        timeControl == "30" ||
        timeControl == "20+1"
      ) {
        timeControl = "🔫";
      } else if (timeControl == "1/0" || timeControl == "0/1") {
        timeControl = "🤖";
      }

      li.innerHTML = `<div class="flex"><div style="color: #d2b48c"> ${whiteUsername}: </div>  <div>${whiteRating}</div> vs <div style="color: #d2b48c"> ${blackUsername}: </div> <div>${blackRating}</div> <div>${timeControl}</div> <div>${gameResult}</div></div>`;

      let pgnInput = document.getElementById("pgnInput");

      li.addEventListener("click", () => {
        pgnInput.value = data[i].pgn;
        modal.style.display = "none";
      });

      gamesList.prepend(li);
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas pobierania danych:", error);
  }
}

// Get the modal element
function openModal() {
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function getCurrentDateYYYYMM() {
  let today = new Date();
  let year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  return `${year}-${month}`;
}

let searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener("click", () => {
  let gamesList = document.querySelector(".games-list");
  gamesList.innerHTML = "";

  username = searchInput.value;
  date = inputDate.value;
  date = date.replace(/-/g, "/");
  fetchData(username, date);
});

//////////////////////////

let analiseCurrentPossitionBtn = document.getElementById(
  "analiseCurrentPossitionBtn"
);

let analysisMove = 0;
let turn = "white";

function onDragStart() {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for the side to move
  if (game.turn() === "w" || game.turn() === "b") {
    return false;
  }
}

function onDrop() {
  setTimeout(() => {
    let newFen = board.fen();

    let newNumLines = 8;
    let newDepth = depthSlider.value;

    let gameTurnDiv = document.querySelector(".gameTurn");

    if (turn == "white") {
      newFen = board.fen() + " w ";
      turn = "black";
      gameTurnDiv.textContent = "White to play";
    } else if (turn == "black") {
      newFen = board.fen() + " b ";
      turn = "white";
      gameTurnDiv.textContent = "Black to play";
    }

    analysisMove++;

    const newStockfish = new Stockfish();
    newStockfish
      .generateBestPositions(newFen, newNumLines, newDepth)
      .then((analyses) => {
        const sortedAnalyses = analyses.sort((a, b) => a.id - b.id);
        let newAnalysis = sortedAnalyses[0].evaluation.value;

        let percValue = calcPerc(newAnalysis / 100).valueForWhite;
        const evalBar = document.getElementById("evalbar");
        const evalBarAfter = window
          .getComputedStyle(evalBar, "::after")
          .getPropertyValue("content");
        const evalBarAfterStyle = document.createElement("style");
        evalBarAfterStyle.innerHTML = `
          #evalbar::after {
            content: "${(newAnalysis / 100).toFixed(1)}";
            color: #7f7f7f;
            height: calc((${percValue} / 100) * 496px);
          }
        `;
        document.head.appendChild(evalBarAfterStyle);

        removeAllPaintedSquares();

        let lightSquares = document.querySelectorAll(".white-1e1d7");
        let darkSquares = document.querySelectorAll(".black-3c85d");
        lightSquares.forEach((ls) => {
          ls.style.background = "#FCE4BE";
        });
        darkSquares.forEach((ds) => {
          ds.style.background = "#BE8F68";
        });

        let positionEvaluationDiv = document.querySelector(
          ".positionEvaluation"
        );

        if (sortedAnalyses.length >= 1) {
          if (showAnalise) {
            positionEvaluationDiv.innerHTML = `
        <p>${sortedAnalyses[0].moveUCI}: ${(
              sortedAnalyses[0].evaluation.value / 100
            ).toFixed(1)}</p>
        `;

            // top move
            let topMoveFrom = sortedAnalyses[0].moveUCI.substring(0, 2);
            let topMoveTo = sortedAnalyses[0].moveUCI.substring(2);
            const topSquareFrom = document.querySelector(
              `[data-square=${topMoveFrom}]`
            );
            const topSquareTo = document.querySelector(
              `[data-square=${topMoveTo}]`
            );
            topSquareFrom.style.background = "#537B2F";
            topSquareTo.style.background = "#537B2F";

            let topMoveClassificationDiv = document.createElement("div");
            topMoveClassificationDiv.classList.add("icon");
            topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            topSquareTo.appendChild(topMoveClassificationDiv);
          }
        }

        if (sortedAnalyses.length >= 2) {
          if (showAnalise) {
            positionEvaluationDiv.innerHTML = `
        <p>${sortedAnalyses[0].moveUCI}: ${(
              sortedAnalyses[0].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[1].moveUCI}: ${(
              sortedAnalyses[1].evaluation.value / 100
            ).toFixed(1)}</p>
        `;

            // second move
            let secondMoveFrom = sortedAnalyses[1].moveUCI.substring(0, 2);
            let secondMoveTo = sortedAnalyses[1].moveUCI.substring(2);
            const secondSquareFrom = document.querySelector(
              `[data-square=${secondMoveFrom}]`
            );
            const secondSquareTo = document.querySelector(
              `[data-square=${secondMoveTo}]`
            );
            secondSquareFrom.style.background = "#3D856F";
            secondSquareTo.style.background = "#3D856F";

            let secondMoveClassificationDiv = document.createElement("div");
            secondMoveClassificationDiv.classList.add("icon");
            secondMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number2.png")`;
            secondSquareTo.appendChild(secondMoveClassificationDiv);

            // top move
            let topMoveFrom = sortedAnalyses[0].moveUCI.substring(0, 2);
            let topMoveTo = sortedAnalyses[0].moveUCI.substring(2);
            const topSquareFrom = document.querySelector(
              `[data-square=${topMoveFrom}]`
            );
            const topSquareTo = document.querySelector(
              `[data-square=${topMoveTo}]`
            );
            topSquareFrom.style.background = "#537B2F";
            topSquareTo.style.background = "#537B2F";

            let topMoveClassificationDiv = document.createElement("div");
            topMoveClassificationDiv.classList.add("icon");
            topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            topSquareTo.appendChild(topMoveClassificationDiv);
          }
        }

        if (sortedAnalyses.length >= 3) {
          if (showAnalise) {
            positionEvaluationDiv.innerHTML = `
        <p>${sortedAnalyses[0].moveUCI}: ${(
              sortedAnalyses[0].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[1].moveUCI}: ${(
              sortedAnalyses[1].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[2].moveUCI}: ${(
              sortedAnalyses[2].evaluation.value / 100
            ).toFixed(1)}</p>
        `;

            // third move
            let thirdMoveFrom = sortedAnalyses[2].moveUCI.substring(0, 2);
            let thirdMoveTo = sortedAnalyses[2].moveUCI.substring(2);
            const thirdSquareFrom = document.querySelector(
              `[data-square=${thirdMoveFrom}]`
            );
            const thirdSquareTo = document.querySelector(
              `[data-square=${thirdMoveTo}]`
            );
            thirdSquareFrom.style.background = "#2D6585";
            thirdSquareTo.style.background = "#2D6585";

            let thirdMoveClassificationDiv = document.createElement("div");
            thirdMoveClassificationDiv.classList.add("icon");
            thirdMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number3.png")`;
            thirdSquareTo.appendChild(thirdMoveClassificationDiv);

            // second move
            let secondMoveFrom = sortedAnalyses[1].moveUCI.substring(0, 2);
            let secondMoveTo = sortedAnalyses[1].moveUCI.substring(2);
            const secondSquareFrom = document.querySelector(
              `[data-square=${secondMoveFrom}]`
            );
            const secondSquareTo = document.querySelector(
              `[data-square=${secondMoveTo}]`
            );
            secondSquareFrom.style.background = "#3D856F";
            secondSquareTo.style.background = "#3D856F";

            let secondMoveClassificationDiv = document.createElement("div");
            secondMoveClassificationDiv.classList.add("icon");
            secondMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number2.png")`;
            secondSquareTo.appendChild(secondMoveClassificationDiv);

            // top move
            let topMoveFrom = sortedAnalyses[0].moveUCI.substring(0, 2);
            let topMoveTo = sortedAnalyses[0].moveUCI.substring(2);
            const topSquareFrom = document.querySelector(
              `[data-square=${topMoveFrom}]`
            );
            const topSquareTo = document.querySelector(
              `[data-square=${topMoveTo}]`
            );
            topSquareFrom.style.background = "#537B2F";
            topSquareTo.style.background = "#537B2F";

            let topMoveClassificationDiv = document.createElement("div");
            topMoveClassificationDiv.classList.add("icon");
            topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            topSquareTo.appendChild(topMoveClassificationDiv);
          }
        }

        if (sortedAnalyses.length >= 4) {
          if (showAnalise) {
            positionEvaluationDiv.innerHTML = `
        <p>${sortedAnalyses[0].moveUCI}: ${(
              sortedAnalyses[0].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[1].moveUCI}: ${(
              sortedAnalyses[1].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[2].moveUCI}: ${(
              sortedAnalyses[2].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[3].moveUCI}: ${(
              sortedAnalyses[3].evaluation.value / 100
            ).toFixed(1)}</p>
        `;

            // third move
            let thirdMoveFrom = sortedAnalyses[2].moveUCI.substring(0, 2);
            let thirdMoveTo = sortedAnalyses[2].moveUCI.substring(2);
            const thirdSquareFrom = document.querySelector(
              `[data-square=${thirdMoveFrom}]`
            );
            const thirdSquareTo = document.querySelector(
              `[data-square=${thirdMoveTo}]`
            );
            thirdSquareFrom.style.background = "#2D6585";
            thirdSquareTo.style.background = "#2D6585";

            let thirdMoveClassificationDiv = document.createElement("div");
            thirdMoveClassificationDiv.classList.add("icon");
            thirdMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number3.png")`;
            thirdSquareTo.appendChild(thirdMoveClassificationDiv);

            // second move
            let secondMoveFrom = sortedAnalyses[1].moveUCI.substring(0, 2);
            let secondMoveTo = sortedAnalyses[1].moveUCI.substring(2);
            const secondSquareFrom = document.querySelector(
              `[data-square=${secondMoveFrom}]`
            );
            const secondSquareTo = document.querySelector(
              `[data-square=${secondMoveTo}]`
            );
            secondSquareFrom.style.background = "#3D856F";
            secondSquareTo.style.background = "#3D856F";

            let secondMoveClassificationDiv = document.createElement("div");
            secondMoveClassificationDiv.classList.add("icon");
            secondMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number2.png")`;
            secondSquareTo.appendChild(secondMoveClassificationDiv);

            // top move
            let topMoveFrom = sortedAnalyses[0].moveUCI.substring(0, 2);
            let topMoveTo = sortedAnalyses[0].moveUCI.substring(2);
            const topSquareFrom = document.querySelector(
              `[data-square=${topMoveFrom}]`
            );
            const topSquareTo = document.querySelector(
              `[data-square=${topMoveTo}]`
            );
            topSquareFrom.style.background = "#537B2F";
            topSquareTo.style.background = "#537B2F";

            let topMoveClassificationDiv = document.createElement("div");
            topMoveClassificationDiv.classList.add("icon");
            topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            topSquareTo.appendChild(topMoveClassificationDiv);
          }
        }

        if (sortedAnalyses.length >= 5) {
          if (showAnalise) {
            positionEvaluationDiv.innerHTML = `
        <p>${sortedAnalyses[0].moveUCI}: ${(
              sortedAnalyses[0].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[1].moveUCI}: ${(
              sortedAnalyses[1].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[2].moveUCI}: ${(
              sortedAnalyses[2].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[3].moveUCI}: ${(
              sortedAnalyses[3].evaluation.value / 100
            ).toFixed(1)}</p>
        <p>${sortedAnalyses[4].moveUCI}: ${(
              sortedAnalyses[4].evaluation.value / 100
            ).toFixed(1)}</p>
        `;

            // third move
            let thirdMoveFrom = sortedAnalyses[2].moveUCI.substring(0, 2);
            let thirdMoveTo = sortedAnalyses[2].moveUCI.substring(2);
            const thirdSquareFrom = document.querySelector(
              `[data-square=${thirdMoveFrom}]`
            );
            const thirdSquareTo = document.querySelector(
              `[data-square=${thirdMoveTo}]`
            );
            thirdSquareFrom.style.background = "#2D6585";
            thirdSquareTo.style.background = "#2D6585";

            let thirdMoveClassificationDiv = document.createElement("div");
            thirdMoveClassificationDiv.classList.add("icon");
            thirdMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number3.png")`;
            thirdSquareTo.appendChild(thirdMoveClassificationDiv);

            // second move
            let secondMoveFrom = sortedAnalyses[1].moveUCI.substring(0, 2);
            let secondMoveTo = sortedAnalyses[1].moveUCI.substring(2);
            const secondSquareFrom = document.querySelector(
              `[data-square=${secondMoveFrom}]`
            );
            const secondSquareTo = document.querySelector(
              `[data-square=${secondMoveTo}]`
            );
            secondSquareFrom.style.background = "#3D856F";
            secondSquareTo.style.background = "#3D856F";

            let secondMoveClassificationDiv = document.createElement("div");
            secondMoveClassificationDiv.classList.add("icon");
            secondMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/number2.png")`;
            secondSquareTo.appendChild(secondMoveClassificationDiv);

            // top move
            let topMoveFrom = sortedAnalyses[0].moveUCI.substring(0, 2);
            let topMoveTo = sortedAnalyses[0].moveUCI.substring(2);
            const topSquareFrom = document.querySelector(
              `[data-square=${topMoveFrom}]`
            );
            const topSquareTo = document.querySelector(
              `[data-square=${topMoveTo}]`
            );
            topSquareFrom.style.background = "#537B2F";
            topSquareTo.style.background = "#537B2F";

            let topMoveClassificationDiv = document.createElement("div");
            topMoveClassificationDiv.classList.add("icon");
            topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            topSquareTo.appendChild(topMoveClassificationDiv);
          }
        }
      });
  }, 0);
}

analiseCurrentPossitionBtn.addEventListener("click", () => {
  showAnalise = !showAnalise;

  let positionEvaluationDiv = document.querySelector(".positionEvaluation");
  positionEvaluationDiv.innerHTML = "";

  if (showAnalise) {
    removeAllPaintedSquares();
    analiseCurrentPossitionBtn.textContent = `Enable Analise: yes`;
    board = Chessboard("myBoard", {
      position: board.fen(),
      draggable: true,
      pieceTheme: `chesspieces/${piecesSet}/{piece}.png`,
      onDrop: onDrop,
      dropOffBoard: "trash",
      sparePieces: true,
    });

    if (raport.fen[currentMove].includes(" w ")) {
      turn = "white";
    } else if (raport.fen[currentMove].includes(" b ")) {
      turn = "black";
    }

    // Analysis
    analysis = "true";
    localStorage.setItem("analysis", "true");

    // declarations
    let body = document.querySelector("body");
    let button = document.querySelectorAll("button");
    let lightSquares = document.querySelectorAll(".white-1e1d7");
    let darkSquares = document.querySelectorAll(".black-3c85d");
    let boardStyle = document.querySelector(".board-b72b1");

    let generalRaport = document.querySelector(".generalRaport");
    let moreDetails = document.querySelector(".moreDetails");
    let evalbar = document.querySelector("#evalbar");

    // styles
    body.style.color = "#d2b48c";
    body.style.background = "#262421";
    boardStyle.style.border = "6px solid #ff0000";
    boardStyle.style.padding = "0 0 -4px 0";

    generalRaport.style.margin = "100px 0 0";
    moreDetails.style.margin = "100px 0 0";
    evalbar.style.margin = "100px 20px";

    button.forEach((btn) => {
      btn.style.background = "#7e5634";
    });

    lightSquares.forEach((ls) => {
      ls.style.background = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#BE8F68";
    });
  } else {
    let gameTurnDiv = document.querySelector(".gameTurn");
    gameTurnDiv.textContent = "";
    analysisMove = 0;
    removeAllPaintedSquares();
    analiseCurrentPossitionBtn.textContent = `Enable Analise: no`;
    board = Chessboard("myBoard", {
      position: board.fen(),
      draggable: false,
      pieceTheme: `chesspieces/${piecesSet}/{piece}.png`,
    });

    let generalRaport = document.querySelector(".generalRaport");
    let moreDetails = document.querySelector(".moreDetails");
    let evalbar = document.querySelector("#evalbar");
    generalRaport.style.margin = "28px 0 0";
    moreDetails.style.margin = "28px 0 0";
    evalbar.style.margin = "30px 20px";

    paintSquares();
  }

  if (!showAnalise) {
    theme = localStorage.getItem("theme");

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
        case "glass":
        themeGlass.click();
        break;
      default:
        "default";
        themeDefault.click();
        break;
    }
  } else if (showAnalise) {
    onDrop();
  }

  paintSquares();
});

let currentMove = 0;

let raport = {
  playerMoves: [""],
  bestMoves: ["e2e4, d2d4, c2c4, g1f3, b1c3"],
  evals: [0],
  types: ["cp"],
  colors: ["#4d702c"],
  pgn: {},
  pgnMoves: [],
  fen: [],
  comment: [""],
  message: [""],
};

let accurateMoves = ["e2e4, d2d4, c2c4, g1f3, b1c3"];
let whiteAccMoves = ["e2e4, d2d4, c2c4, g1f3, b1c3"];
let blackAccMoves = [""];

let accuracyValue = 0;
let whiteAccVal = 0;
let blackAccVal = 0;

let openingMoveCoutner = 2;
let openingWhiteValue = 0;
let openingBlackValue = 0;

let middlegameTrigger = false;
let middlegameMoveCoutner = 0;
let middlegameWhiteValue = 0;
let middlegameBlackValue = 0;

let endgameTrigger = false;
let endgameMoveCoutner = 0;
let endgameWhiteValue = 0;
let endgameBlackValue = 0;

let avgWhiteAcc;

let depthSlider = document.getElementById("depth-slider");
let depthLabel = document.getElementById("depth-label");

depthSlider.addEventListener("input", function () {
  depthLabel.textContent = "Depth: " + depthSlider.value;
});

// Review Forward and Backward
document
  .getElementById("reviewBtnForward")
  .addEventListener("click", () => gameReview("forward"));

document
  .getElementById("reviewBtnBackward")
  .addEventListener("click", () => gameReview("backward"));

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    gameReview("backward");
    if (showAnalise) {
      $("#analiseCurrentPossitionBtn").trigger("click");
      localStorage.setItem("analysis", "false");
    }
  } else if (event.key === "ArrowRight") {
    gameReview("forward");
    if (showAnalise) {
      $("#analiseCurrentPossitionBtn").trigger("click");
      localStorage.setItem("analysis", "false");
    }
  } else if (event.key === "ArrowDown") {
    currentMove = raport.pgnMoves.length;
    board.position(raport.fen[currentMove]);
    removeAllPaintedSquares();
    $("#reviewBtnForward").trigger("click");
  } else if (event.key === "ArrowUp") {
    currentMove = 0;
    board.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    removeAllPaintedSquares();
    $("#reviewBtnBackward").trigger("click");
  }

  // else if (event.key === "e") {
  //   let bestMoveAsistantBtn = document.getElementById("bestMoveAsistantBtn");
  //   showEngineBestMoves = !showEngineBestMoves;
  //   $("#reviewBtnBackward").trigger("click");
  //   $("#reviewBtnForward").trigger("click");
  //   if (showEngineBestMoves) {
  //     bestMoveAsistantBtn.textContent = `Engine Moves: yes`;
  //   } else {
  //     bestMoveAsistantBtn.textContent = `Engine Moves: no`;
  //   }
  // } else if (event.key === "q") {
  //   $("#analiseCurrentPossitionBtn").trigger("click");
  // } else if (event.key === "f") {
  //   $("#flipOrientationBtn").trigger("click");
  // } else if (event.key === "t") {
  //   $("#showThreatsBtn").trigger("click");
  // }
});

function isEven(value) {
  if (value % 2 == 0) return true;
  else return false;
}

function confirmPgn() {
  const pgnInput = document.getElementById("pgnInput").value;
  const moves = stringToMoveArray(pgnInput);
  let pgnStatus = document.getElementById("pgnStatus");
  removeAllPaintedSquares();

  if (moves.length > 0) {
    pgn = moves;
    currentMove = 0;
    game.reset();
    board.position(game.fen());
    pgnStatus.textContent = `PGN loaded successfully`;
  } else {
    pgnStatus.textContent = `Invalid PGN input`;
  }
}

// Generate Raport
document
  .getElementById("generateRaport")
  .addEventListener("click", () => generateRaport());

let pgnArr = [];

// Convert string
function convertString(str) {
  const moves = str.split(" ");

  if (moves.length === 1) {
    return "1. " + moves[0];
  }

  let convertedStr = "1. " + moves[0] + " " + moves[1];
  let moveNumber = 2;

  for (let i = 2; i < moves.length; i += 2) {
    convertedStr += ` ${moveNumber}. ${moves[i]}`;
    if (moves[i + 1]) {
      convertedStr += " " + moves[i + 1];
    }
    moveNumber++;
  }
  return convertedStr;
}

async function generateRaport(result) {
  confirmPgn();
  pgn.push("");
  raport.pgn = pgn;
  for (let i = 0; i < pgn.length - 2; i++) {
    if (currentMove < pgn.length - 2) {
      currentMove++;
      raport.fen.push(game.fen());
      let pgnClone = pgn.slice(0, currentMove).join(" ");

      const convertedString = convertString(pgnClone);
      raport.pgnMoves.push(convertedString);

      game.load_pgn(pgnClone);
      board.position(game.fen());

      const fen = game.fen();
      const stockfish = new Stockfish();

      let analizeProgress = Math.round(((i + 2) / pgn.length) * 100);

      pgnArr = pgnClone.split(" ");

      if (pgnClone.includes("#")) {
        checkResult();

        game.load_pgn(pgnClone);
        board.position(game.fen());
        raport.fen.push(game.fen());
        analizeProgress = 100;

        const analiseProgressDiv = document.getElementById("analiseProgress");
        analiseProgressDiv.textContent = analizeProgress;
        analiseProgressDiv.innerHTML = `<div id="analizeProgress" style="color: #fff;">${analizeProgress} % complete</div>`;

        const displayMovesDiv = document.getElementById("displayMoves");
        const moveEvaluationDiv = document.getElementById("moveEvaluation");
        displayMovesDiv.innerHTML = "";
        moveEvaluationDiv.innerHTML = "";
        analiseProgressDiv.innerHTML = `<div id="analizeProgress" style="color: #fff;">Analysis completed!</div>`;

        board.position(raport.fen[0]);
        displayAccuracy();
        countTallies();
        displayTallies();
        displayRanking();

        displayNotatons();

        moveEvaluationDiv.innerHTML = `<span style="color: #FFD700;"><b>Checkmate!</b></span>`;
        raport.message.push(moveEvaluationDiv.innerHTML);

        displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #FFD700;">${
          raport.pgn[raport.pgn.length - 3]
        }</div>`;
        raport.comment.push(displayMovesDiv.innerHTML);

        return (currentMove = 0);
      } else if (raport.pgn.length - 2 == pgnArr.length) {
        removeAllPaintedSquares();
        game.load_pgn(pgnClone);
        board.position(game.fen());
        raport.fen.push(game.fen());

        const analiseProgressDiv = document.getElementById("analiseProgress");
        analiseProgressDiv.innerHTML = `<div id="analizeProgress" style="color: #fff;">Analysis completed!</div>`;

        const displayMovesDiv = document.getElementById("displayMoves");
        const moveEvaluationDiv = document.getElementById("moveEvaluation");

        displayMovesDiv.textContent = "";
        raport.comment.push(displayMovesDiv.innerHTML);

        moveEvaluationDiv.innerHTML = checkResult();
        raport.message.push(moveEvaluationDiv.innerHTML);

        board.position(raport.fen[0]);
        displayAccuracy();
        countTallies();
        displayTallies();
        displayRanking();

        displayNotatons();

        return (currentMove = 0);
      } else {
        if (currentMove <= 17) {
          openingMoveCoutner++;
        }
        if (currentMove > 16) {
          middlegameTrigger = true;
          middlegameMoveCoutner++;
        }
        if (endgameTrigger == true) {
          endgameMoveCoutner++;
        }

        if (i >= 2) {
          let fen = game.fen();
          isEndgame(fen);

          if (
            accurateMoves[i - 1].includes(raport.playerMoves[i]) ||
            bookMove == true
          ) {
            accuracyValue++;

            if (isEven(i)) {
              if (currentMove <= 17) {
                openingBlackValue++;
              }
              if (currentMove > 16 && endgameTrigger == false) {
                middlegameBlackValue++;
              }
              if (endgameTrigger == true) {
                endgameBlackValue++;
              }
            } else {
              if (currentMove <= 17) {
                openingWhiteValue++;
              }
              if (currentMove > 16 && endgameTrigger == false) {
                middlegameWhiteValue++;
              }
              if (endgameTrigger == true) {
                endgameWhiteValue++;
              }
            }
          }
        }
      }

      removeAllPaintedSquares();

      const analiseProgressDiv = document.getElementById("analiseProgress");
      analiseProgressDiv.textContent = analizeProgress;
      analiseProgressDiv.innerHTML = `<div id="analizeProgress" style="color: #fff;">${analizeProgress} % complete</div>`;

      if (analizeProgress == 100) {
        const displayMovesDiv = document.getElementById("displayMoves");
        const moveEvaluationDiv = document.getElementById("moveEvaluation");
        displayMovesDiv.innerHTML = "";
        moveEvaluationDiv.innerHTML = "";
        analiseProgressDiv.innerHTML = `<div id="analizeProgress" style="color: #fff;">Analysis completed!</div>`;
        board.position(raport.fen[0]);

        displayAccuracy();
        countTallies();
        displayTallies();
        displayRanking();
        displayNotatons();

        return (currentMove = 0);
      }

      await DisplayBestPositions(
        fen,
        stockfish,
        parseInt(depthSlider.value),
        pgnClone
      );
    } else {
      console.log("End of PGN reached.");
      break;
    }
  }
}

function checkIfBookMove() {
  let pgnStatusDiv = document.querySelector("#pgnStatus");

  for (let i = 0; i < eco.length; i++) {
    if (eco[i].moves === raport.pgnMoves[currentMove - 1]) {
      bookMove = true;
      openingName = eco[i].name;
      pgnStatusDiv.innerHTML = openingName;
      pgnStatusDiv.style.color = "#deb18e";
      pgnStatusDiv.style.fontWeight = "bold";
      return;
    }
  }

  bookMove = false;
}

function paintSquares(playerMove, curentColor) {
  removeAllPaintedSquares();

  checkIfBookMove();

  if (bookMove == true) {
    if (raport.playerMoves[currentMove]) {
      let playerMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
      let playerMoveTo = raport.playerMoves[currentMove].substring(2);

      const squareFrom = document.querySelector(
        `[data-square=${playerMoveFrom}]`
      );
      const squareTo = document.querySelector(`[data-square=${playerMoveTo}]`);

      if (squareFrom && squareTo) {
        squareFrom.style.background = "#deb18e";
        squareTo.style.background = "#deb18e";

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        moveClassificationDiv.style.backgroundImage = `url("/move_classifications/book.png")`;

        squareTo.appendChild(moveClassificationDiv);

        let displayMovesDiv = document.getElementById("displayMoves");
        const moveEvaluationDiv = document.getElementById("moveEvaluation");
        displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #deb18e;">${openingName}</div>`;
        moveEvaluationDiv.innerHTML = `<span style="color: #deb18e;"><b>Book Move</b></span>`;
      }
    }
  } else if (bookMove == false) {
    if (
      raport.playerMoves[currentMove] &&
      raport.evals[currentMove] > -500 &&
      raport.evals[currentMove] < 500
    ) {
      let playerMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
      let playerMoveTo = raport.playerMoves[currentMove].substring(2);

      const squareFrom = document.querySelector(
        `[data-square=${playerMoveFrom}]`
      );
      const squareTo = document.querySelector(`[data-square=${playerMoveTo}]`);

      if (squareFrom && squareTo) {
        squareFrom.style.background = curentColor;
        squareTo.style.background = curentColor;

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        switch (curentColor) {
          case "#8ff7e3":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;
            break;
          case "#76acde":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;
            break;
          case "#97cc64":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            break;
          case "#90c959":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
            break;
          case "#a5c983":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
            break;
          case "#f7e36d":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
            break;
          case "#f2c28a":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
            break;
          case "#f58073":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/blunder.png")`;
            break;
          default:
            // No image set for the backgroundImage property
            break;
        }
        squareTo.appendChild(moveClassificationDiv);
      }
    } else {
      let playerMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
      let playerMoveTo = raport.playerMoves[currentMove].substring(2);

      const squareFrom = document.querySelector(
        `[data-square=${playerMoveFrom}]`
      );
      const squareTo = document.querySelector(`[data-square=${playerMoveTo}]`);

      if (squareFrom && squareTo) {
        squareFrom.style.background = curentColor;
        squareTo.style.background = curentColor;

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        switch (curentColor) {
          case "#97cc64":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            break;
          case "#90c959":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
            break;
          case "#a5c983":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
            break;
          case "#f7e36d":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
            break;
          case "#f2c28a":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
            break;
          case "#f58073":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/blunder.png")`;
            break;
          default:
            // No image set for the backgroundImage property
            break;
        }
        squareTo.appendChild(moveClassificationDiv);
      }
    }
  }

  if (showEngineBestMoves) {
    if (raport.bestMoves[currentMove] && currentMove >= 1) {
      let engineMoveFrom = raport.bestMoves[currentMove - 1].substring(0, 2);
      let engineMoveTo = raport.bestMoves[currentMove - 1].substring(2);

      const squareFrom = document.querySelector(
        `[data-square=${engineMoveFrom}]`
      );
      const squareTo = document.querySelector(`[data-square=${engineMoveTo}]`);
      if (squareFrom && squareTo) {
        squareFrom.style.background = "#4d702c";
        squareTo.style.background = "#4d702c";

        let bestMoveClassificationDiv = document.createElement("div");
        bestMoveClassificationDiv.classList.add("icon");
        bestMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
        squareTo.appendChild(bestMoveClassificationDiv);
      }
    }
  }

  if (
    raport.types[currentMove - 1] == "mate" &&
    raport.types[currentMove] == "cp"
  ) {
    let missMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
    let missMoveTo = raport.playerMoves[currentMove].substring(2);

    const squareFrom = document.querySelector(`[data-square=${missMoveFrom}]`);
    const squareTo = document.querySelector(`[data-square=${missMoveTo}]`);
    if (squareFrom && squareTo) {
      squareFrom.style.background = "#c96157";
      squareTo.style.background = "#c96157";

      let missClassificationDiv = document.createElement("div");
      missClassificationDiv.classList.add("icon");
      missClassificationDiv.style.backgroundImage = `url("/move_classifications/miss.png")`;
      squareTo.appendChild(missClassificationDiv);

      const displayMovesDiv = document.getElementById("displayMoves");
      const moveEvaluationDiv = document.getElementById("moveEvaluation");

      displayMovesDiv.style.color = "#FF7769";
      moveEvaluationDiv.innerHTML = `<span style="color: #FF7769;"><b>Missed win</b></span>`;
    }
  }

  if (showThreats) {
    let playerMoveTo = raport.playerMoves[currentMove].substring(2);

    if (
      raport.colors[currentMove] == "#f58073" ||
      raport.colors[currentMove] == "#f2c28a"
    ) {
      let threateningMoveFrom = raport.bestMoves[currentMove].substring(0, 2);
      let threateningMoveTo = raport.bestMoves[currentMove].substring(2);

      const squareFrom = document.querySelector(
        `[data-square=${threateningMoveFrom}]`
      );
      const squareTo = document.querySelector(
        `[data-square=${threateningMoveTo}]`
      );
      if (squareFrom && squareTo) {
        squareFrom.style.background = "#8976B7";
        squareTo.style.background = "#8976B7";

        let bestMoveClassificationDiv = document.createElement("div");
        bestMoveClassificationDiv.classList.add("icon");
        bestMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/threat.png")`;
        squareTo.appendChild(bestMoveClassificationDiv);
      }

      let moveEvaluationDiv = document.querySelector("#moveEvaluation");

      if (raport.colors[currentMove] == "#f2c28a") {
        moveEvaluationDiv.innerHTML = `<div style="color: #f2c28a">Mistake</div><div style="color: #fff">${raport.bestMoves[currentMove]}<span style="color: #8976B7"> threatens!</span></div>`;
      }

      if (raport.colors[currentMove] == "#f58073") {
        moveEvaluationDiv.innerHTML = `<div style="color: #f58073">Blunder</div><div style="color: #fff">${raport.bestMoves[currentMove]}<span style="color: #8976B7"> threatens!
    </span></div>`;
      }

      if (threateningMoveTo == playerMoveTo) {
        if (raport.colors[currentMove] == "#f2c28a") {
          squareTo.style.background =
            "linear-gradient(135deg, #8976b7 20%, #f2c28a 90%)";

          let bestMoveClassificationDiv = document.createElement("div");
          bestMoveClassificationDiv.classList.add("icon");
          bestMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
          squareTo.appendChild(bestMoveClassificationDiv);
        }

        if (raport.colors[currentMove] == "#f58073") {
          squareTo.style.background =
            "linear-gradient(135deg, #8976b7 20%, #f58073 90%)";

          let bestMoveClassificationDiv = document.createElement("div");
          bestMoveClassificationDiv.classList.add("icon");
          bestMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/blunder.png")`;
          squareTo.appendChild(bestMoveClassificationDiv);
        }
      }
    }
  }

  // If mistake -> great move
  if (
    raport.colors[currentMove - 1] == "#f2c28a" &&
    raport.colors[currentMove] == "#97cc64"
  ) {
    let greatMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
    let greatMoveTo = raport.playerMoves[currentMove].substring(2);

    const squareFrom = document.querySelector(`[data-square=${greatMoveFrom}]`);
    const squareTo = document.querySelector(`[data-square=${greatMoveTo}]`);

    if (squareFrom && squareTo) {
      squareFrom.style.background = "#76acde";
      squareTo.style.background = "#76acde";

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;

      squareTo.appendChild(moveClassificationDiv);

      const moveEvaluationDiv = document.getElementById("moveEvaluation");
      moveEvaluationDiv.innerHTML = `<span style="color: #76acde;"><b>Great Answer!</b></span>`;
    }
  }

  // If blunder -> brilliant move
  if (
    raport.colors[currentMove - 1] == "#f58073" &&
    raport.colors[currentMove] == "#97cc64"
  ) {
    let excellentMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
    let excellentMoveTo = raport.playerMoves[currentMove].substring(2);

    const squareFrom = document.querySelector(
      `[data-square=${excellentMoveFrom}]`
    );
    const squareTo = document.querySelector(`[data-square=${excellentMoveTo}]`);

    if (squareFrom && squareTo) {
      squareFrom.style.background = "#8ff7e3";
      squareTo.style.background = "#8ff7e3";

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;

      squareTo.appendChild(moveClassificationDiv);

      const moveEvaluationDiv = document.getElementById("moveEvaluation");
      moveEvaluationDiv.innerHTML = `<span style="color: #8ff7e3;"><b>Excellent Answer!</b></span>`;
    }
  }

  // Great Sequence
  if (
    raport.colors[currentMove] == "#97cc64" &&
    raport.colors[currentMove - 2] == "#97cc64" &&
    raport.colors[currentMove - 4] == "#97cc64" &&
    raport.colors[currentMove - 6] == "#97cc64" &&
    raport.colors[currentMove - 8] == "#97cc64"
  ) {
    let sGreatMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
    let sGreatMoveTo = raport.playerMoves[currentMove].substring(2);

    const squareFrom = document.querySelector(
      `[data-square=${sGreatMoveFrom}]`
    );
    const squareTo = document.querySelector(`[data-square=${sGreatMoveTo}]`);

    if (squareFrom && squareTo) {
      squareFrom.style.background = "#76acde";
      squareTo.style.background = "#76acde";

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;

      squareTo.appendChild(moveClassificationDiv);

      const moveEvaluationDiv = document.getElementById("moveEvaluation");
      moveEvaluationDiv.innerHTML = `<span style="color: #76acde;"><b>Great Sequence!</b></span>`;
    }
  }

  // Brilliant Sequence
  if (
    raport.colors[currentMove] == "#97cc64" &&
    raport.colors[currentMove - 2] == "#97cc64" &&
    raport.colors[currentMove - 4] == "#97cc64" &&
    raport.colors[currentMove - 6] == "#97cc64" &&
    raport.colors[currentMove - 8] == "#97cc64" &&
    raport.colors[currentMove - 10] == "#97cc64" &&
    raport.colors[currentMove - 12] == "#97cc64"
  ) {
    let brilliantMoveFrom = raport.playerMoves[currentMove].substring(0, 2);
    let brilliantMoveTo = raport.playerMoves[currentMove].substring(2);

    const squareFrom = document.querySelector(
      `[data-square=${brilliantMoveFrom}]`
    );
    const squareTo = document.querySelector(`[data-square=${brilliantMoveTo}]`);

    if (squareFrom && squareTo) {
      squareFrom.style.background = "#8ff7e3";
      squareTo.style.background = "#8ff7e3";

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;

      squareTo.appendChild(moveClassificationDiv);

      const moveEvaluationDiv = document.getElementById("moveEvaluation");
      moveEvaluationDiv.innerHTML = `<span style="color: #8ff7e3;"><b>Brilliant Sequence!</b></span>`;
    }
  }
}

let excellentCounterWhite = 0;
let greatCounterWhite = 0;
let bestCounterWhite = 0;
let veryGoodCounterWhite = 0;
let goodCounterWhite = 0;
let bookCounterWhite = 0;
let inaccuracyCounterWhite = 0;
let mistakeCounterWhite = 0;
let blunderCounterWhite = 0;

let excellentCounterBlack = 0;
let greatCounterBlack = 0;
let bestCounterBlack = 0;
let veryGoodCounterBlack = 0;
let goodCounterBlack = 0;
let bookCounterBlack = 0;
let inaccuracyCounterBlack = 0;
let mistakeCounterBlack = 0;
let blunderCounterBlack = 0;

let excellentCounterWhiteDiv = document.querySelector(".excellentCounterWhite");
let greatCounterWhiteDiv = document.querySelector(".greatCounterWhite");
let bestCounterWhiteDiv = document.querySelector(".bestCounterWhite");
let veryGoodCounterWhiteDiv = document.querySelector(".veryGoodCounterWhite");
let goodCounterWhiteDiv = document.querySelector(".goodCounterWhite");
let bookCounterWhiteDiv = document.querySelector(".bookCounterWhite");
let inaccuracyCounterWhiteDiv = document.querySelector(
  ".inaccuracyCounterWhite"
);
let mistakeCounterWhiteDiv = document.querySelector(".mistakeCounterWhite");
let blunderCounterWhiteDiv = document.querySelector(".blunderCounterWhite");

let excellentCounterBlackDiv = document.querySelector(".excellentCounterBlack");
let greatCounterBlackDiv = document.querySelector(".greatCounterBlack");
let bestCounterBlackDiv = document.querySelector(".bestCounterBlack");
let veryGoodCounterBlackDiv = document.querySelector(".veryGoodCounterBlack");
let goodCounterBlackDiv = document.querySelector(".goodCounterBlack");
let bookCounterBlackDiv = document.querySelector(".bookCounterBlack");
let inaccuracyCounterBlackDiv = document.querySelector(
  ".inaccuracyCounterBlack"
);
let mistakeCounterBlackDiv = document.querySelector(".mistakeCounterBlack");
let blunderCounterBlackDiv = document.querySelector(".blunderCounterBlack");

function countTallies() {
  for (let i = 0; i <= raport.colors.length; i++) {
    if (isEven(i)) {
      if (raport.colors[i] == "#8ff7e3") {
        excellentCounterBlack++;
        excellentCounterBlackDiv.textContent = excellentCounterBlack;
      }
      if (raport.colors[i] == "#76acde") {
        greatCounterBlack++;
        greatCounterBlackDiv.textContent = greatCounterBlack;
      }
      if (raport.colors[i] == "#97cc64") {
        bestCounterBlack++;
        bestCounterBlackDiv.textContent = bestCounterBlack;
      }
      if (raport.colors[i] == "#90c959") {
        veryGoodCounterBlack++;
        veryGoodCounterBlackDiv.textContent = veryGoodCounterBlack;
      }
      if (raport.colors[i] == "#a5c983") {
        goodCounterBlack++;
        goodCounterBlackDiv.textContent = goodCounterBlack;
      }
      if (raport.colors[i] == "#deb18e") {
        bookCounterBlack++;
        bookCounterBlackDiv.textContent = bookCounterBlack;
      }
      if (raport.colors[i] == "#f7e36d") {
        inaccuracyCounterBlack++;
        inaccuracyCounterBlackDiv.textContent = inaccuracyCounterBlack;
      }
      if (raport.colors[i] == "#f2c28a") {
        mistakeCounterBlack++;
        mistakeCounterBlackDiv.textContent = mistakeCounterBlack;
      }
      if (raport.colors[i] == "#f58073") {
        blunderCounterBlack++;
        blunderCounterBlackDiv.textContent = blunderCounterBlack;
      }
    } else {
      if (raport.colors[i] == "#8ff7e3") {
        excellentCounterWhite++;
        excellentCounterWhiteDiv.textContent = excellentCounterWhite;
      }
      if (raport.colors[i] == "#76acde") {
        greatCounterWhite++;
        greatCounterWhiteDiv.textContent = greatCounterWhite;
      }
      if (raport.colors[i] == "#97cc64") {
        bestCounterWhite++;
        bestCounterWhiteDiv.textContent = bestCounterWhite;
      }
      if (raport.colors[i] == "#90c959") {
        veryGoodCounterWhite++;
        veryGoodCounterWhiteDiv.textContent = veryGoodCounterWhite;
      }
      if (raport.colors[i] == "#a5c983") {
        goodCounterWhite++;
        goodCounterWhiteDiv.textContent = goodCounterWhite;
      }
      if (raport.colors[i] == "#deb18e") {
        bookCounterWhite++;
        bookCounterWhiteDiv.textContent = bookCounterWhite;
      }
      if (raport.colors[i] == "#f7e36d") {
        inaccuracyCounterWhite++;
        inaccuracyCounterWhiteDiv.textContent = inaccuracyCounterWhite;
      }
      if (raport.colors[i] == "#f2c28a") {
        mistakeCounterWhite++;
        mistakeCounterWhiteDiv.textContent = mistakeCounterWhite;
      }
      if (raport.colors[i] == "#f58073") {
        blunderCounterWhite++;
        blunderCounterWhiteDiv.textContent = blunderCounterWhite;
      }
    }
  }
}

function displayTallies() {
  excellentCounterWhiteDiv.textContent = excellentCounterWhite;
  greatCounterWhiteDiv.textContent = greatCounterWhite;
  bestCounterWhiteDiv.textContent = bestCounterWhite;
  veryGoodCounterWhiteDiv.textContent = veryGoodCounterWhite;
  goodCounterWhiteDiv.textContent = goodCounterWhite;
  bookCounterWhiteDiv.textContent = bookCounterWhite;
  inaccuracyCounterWhiteDiv.textContent = inaccuracyCounterWhite;
  mistakeCounterWhiteDiv.textContent = mistakeCounterWhite;
  blunderCounterWhiteDiv.textContent = blunderCounterWhite;

  excellentCounterBlackDiv.textContent = excellentCounterBlack;
  greatCounterBlackDiv.textContent = greatCounterBlack;
  bestCounterBlackDiv.textContent = bestCounterBlack;
  veryGoodCounterBlackDiv.textContent = veryGoodCounterBlack;
  goodCounterBlackDiv.textContent = goodCounterBlack;
  bookCounterBlackDiv.textContent = bookCounterBlack;
  inaccuracyCounterBlackDiv.textContent = inaccuracyCounterBlack;
  mistakeCounterBlackDiv.textContent = mistakeCounterBlack;
  blunderCounterBlackDiv.textContent = blunderCounterBlack;
}

function getPieceValue(piece) {
  const pieceValues = {
    P: 1, // Pawn
    N: 3, // Knight
    B: 3, // Bishop
    R: 5, // Rook
    Q: 9, // Queen
    K: 0, // King (no material value)
  };
  return pieceValues[piece.toUpperCase()] || 0;
}

function isEndgame(fen) {
  const fenParts = fen.split(" ");
  const position = fenParts[0];
  const rows = position.split("/");

  let pieceCount = 0;
  let totalMaterial = 0;

  for (const row of rows) {
    for (const char of row) {
      if (isNaN(char)) {
        pieceCount++;
        totalMaterial += getPieceValue(char);
      }
    }
  }

  // Check if either condition is met
  if (pieceCount <= 8 || totalMaterial <= 40) {
    endgameTrigger = true;
  }

  return endgameTrigger;
}

function displayNotatons() {
  const movesContainer = document.querySelector(".moves");

  let pgnData = raport.pgn;
  // pgnData.pop();
  let fenData = raport.fen;
  let colorsData = raport.colors;

  for (let i = 0; i < pgnData.length - 2; i += 2) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("moves-row");

    const numDiv = document.createElement("div");
    numDiv.classList.add("moves-num");
    numDiv.textContent = `${i / 2 + 1}.`;
    rowDiv.appendChild(numDiv);

    const el1Div = document.createElement("div");
    el1Div.classList.add("moves-el");
    el1Div.style.color = colorsData[i + 1];

    if (colorsData[i + 1] == "#deb18e") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/book.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#8ff7e3") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/brilliant.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#76acde") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/great.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#97cc64") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/best.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#90c959") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/very-good.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#a5c983") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/good.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#f7e36d") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/inaccuracy.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#f2c28a") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/mistake.png" /> ` +
        pgnData[i];
    } else if (colorsData[i + 1] == "#f58073") {
      el1Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/blunder.png" /> ` +
        pgnData[i];
    } else {
      el1Div.innerHTML = pgnData[i];
    }

    el1Div.setAttribute("data-fen", fenData[i + 1]);
    el1Div.addEventListener("click", () => {
      board.position(fenData[i + 1]);
      currentMove = i + 1;

      // Paint Squares
      let playerMove1 = raport.playerMoves[currentMove];
      let curentColor1 = raport.colors[currentMove];
      removeAllPaintedSquares();
      fillEvalbar();

      // Paint Squares
      let moveFrom = playerMove1.substring(0, 2);
      let moveTo = playerMove1.substring(2);
      const squareFrom = document.querySelector(`[data-square=${moveFrom}]`);
      const squareTo = document.querySelector(`[data-square=${moveTo}]`);
      squareFrom.style.background = curentColor1;
      squareTo.style.background = curentColor1;

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      switch (curentColor1) {
        case "#deb18e":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/book.png")`;
          break;
        case "#8ff7e3":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;
          break;
        case "#76acde":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;
          break;
        case "#97cc64":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
          break;
        case "#90c959":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
          break;
        case "#a5c983":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
          break;
        case "#f7e36d":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
          break;
        case "#f2c28a":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
          break;
        case "#f58073":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/blunder.png")`;
          break;
        default:
          // No image set for the backgroundImage property
          break;
      }
      squareTo.appendChild(moveClassificationDiv);
    });

    const el2Div = document.createElement("div");
    el2Div.classList.add("moves-el");
    el2Div.style.color = colorsData[i + 2];

    if (colorsData[i + 2] == "#deb18e") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/book.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#8ff7e3") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/brilliant.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#76acde") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/great.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#97cc64") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/best.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#90c959") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/very-good.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#a5c983") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/good.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#f7e36d") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/inaccuracy.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#f2c28a") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/mistake.png" /> ` +
        pgnData[i + 1];
    } else if (colorsData[i + 2] == "#f58073") {
      el2Div.innerHTML =
        `<img class="notation-img" src="/move_classifications/blunder.png" /> ` +
        pgnData[i + 1];
    } else {
      el2Div.innerHTML = pgnData[i + 1];
    }

    el2Div.setAttribute("data-fen", fenData[i + 2]);
    el2Div.addEventListener("click", () => {
      board.position(fenData[i + 2]);
      currentMove = i + 2;

      // Paint Squares
      let playerMove2 = raport.playerMoves[currentMove];
      let curentColor2 = raport.colors[currentMove];
      removeAllPaintedSquares();
      fillEvalbar();

      // Paint Squares
      let moveFrom = playerMove2.substring(0, 2);
      let moveTo = playerMove2.substring(2);
      const squareFrom = document.querySelector(`[data-square=${moveFrom}]`);
      const squareTo = document.querySelector(`[data-square=${moveTo}]`);
      squareFrom.style.background = curentColor2;
      squareTo.style.background = curentColor2;

      let moveClassificationDiv = document.createElement("div");
      moveClassificationDiv.classList.add("icon");

      // Validation
      switch (curentColor2) {
        case "#deb18e":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/book.png")`;
          break;
        case "#8ff7e3":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;
          break;
        case "#76acde":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;
          break;
        case "#97cc64":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
          break;
        case "#90c959":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
          break;
        case "#a5c983":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
          break;
        case "#f7e36d":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
          break;
        case "#f2c28a":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
          break;
        case "#f58073":
          moveClassificationDiv.style.backgroundImage = `url("/move_classifications/blunder.png")`;
          break;
        default:
          // No image set for the backgroundImage property
          break;
      }
      squareTo.appendChild(moveClassificationDiv);
    });

    rowDiv.appendChild(el1Div);
    rowDiv.appendChild(el2Div);

    movesContainer.appendChild(rowDiv);
  }

  return movesContainer;
}

function displayRanking() {
  let avgWhiteRankingDiv = document.querySelector(".avgWhiteRanking");
  let avgBlackRankingDiv = document.querySelector(".avgBlackRanking");

  let whiteAccuracy = (
    (whiteAccVal / (raport.playerMoves.length / 2)) *
    100
  ).toFixed(1);

  let blackAccuracy = (
    (blackAccVal / (raport.playerMoves.length / 2)) *
    100
  ).toFixed(1);

  let avgWhiteRanking = 0;
  let avgBlackRanking = 0;

  if (whiteAccuracy >= 0 && whiteAccuracy < 55) {
    avgWhiteRanking = 100;
  }
  if (whiteAccuracy >= 55 && whiteAccuracy < 60) {
    avgWhiteRanking = 350;
  }
  if (whiteAccuracy >= 60 && whiteAccuracy < 65) {
    avgWhiteRanking = 700;
  }
  if (whiteAccuracy >= 65 && whiteAccuracy < 70) {
    avgWhiteRanking = 1100;
  }
  if (whiteAccuracy >= 70 && whiteAccuracy < 75) {
    avgWhiteRanking = 1500;
  }
  if (whiteAccuracy >= 75 && whiteAccuracy < 80) {
    avgWhiteRanking = 1900;
  }
  if (whiteAccuracy >= 80 && whiteAccuracy < 85) {
    avgWhiteRanking = 2200;
  }
  if (whiteAccuracy >= 85 && whiteAccuracy < 90) {
    avgWhiteRanking = 2700;
  }
  if (whiteAccuracy >= 90 && whiteAccuracy < 95) {
    avgWhiteRanking = 3100;
  }
  if (whiteAccuracy > 95) {
    avgWhiteRanking = 3500;
  }

  if (blackAccuracy >= 0 && blackAccuracy < 55) {
    avgBlackRanking = 100;
  }
  if (blackAccuracy >= 55 && blackAccuracy < 60) {
    avgBlackRanking = 350;
  }
  if (blackAccuracy >= 60 && blackAccuracy < 65) {
    avgBlackRanking = 700;
  }
  if (blackAccuracy >= 65 && blackAccuracy < 70) {
    avgBlackRanking = 1100;
  }
  if (blackAccuracy >= 70 && blackAccuracy < 75) {
    avgBlackRanking = 1500;
  }
  if (blackAccuracy >= 75 && blackAccuracy < 80) {
    avgBlackRanking = 1900;
  }
  if (blackAccuracy >= 80 && blackAccuracy < 85) {
    avgBlackRanking = 2200;
  }
  if (blackAccuracy >= 85 && blackAccuracy < 90) {
    avgBlackRanking = 2700;
  }
  if (blackAccuracy >= 90 && blackAccuracy < 95) {
    avgBlackRanking = 3100;
  }
  if (blackAccuracy > 95) {
    avgWhiteRanking = 3500;
  }

  avgWhiteRankingDiv.innerHTML = avgWhiteRanking;
  avgBlackRankingDiv.innerHTML = avgBlackRanking;
}

function displayComment() {
  const displayMovesDiv = document.getElementById("displayMoves");
  const moveEvaluation = document.getElementById("moveEvaluation");
  displayMovesDiv.innerHTML = raport.comment[currentMove];
  moveEvaluation.innerHTML = raport.message[currentMove];
}

function displayEvalbar() {
  let evalbarValue = document.getElementById("evalbar");
  if (raport.types[currentMove + 1] == "mate") {
    evalbarValue.innerHTML = `M${raport.evals[currentMove]}`;
  } else {
    let value = raport.evals[currentMove] / 100;
    evalbarValue.innerHTML = value.toFixed(1);
  }
}

// Fill evalbar
function linearInterpolation(x, x0, y0, x1, y1) {
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function calcPerc(evalValue) {
  if (evalValue <= -4.5) {
    let valueForWhite = 5;
    let valueForBlack = 95;
    return { valueForWhite, valueForBlack };
  } else if (evalValue >= 4.5) {
    let valueForWhite = 95;
    let valueForBlack = 5;
    return { valueForWhite, valueForBlack };
  } else {
    let value = linearInterpolation(evalValue, -4.5, 5, 4.5, 95);
    value = Math.round(value);
    let valueForWhite = Math.floor(value);
    let valueForBlack = Math.floor(100 - value);
    return { valueForWhite, valueForBlack };
  }
}

function fillEvalbar() {
  let percValue = calcPerc(raport.evals[currentMove] / 100).valueForWhite;
  const evalBar = document.getElementById("evalbar");
  const evalBarAfter = window
    .getComputedStyle(evalBar, "::after")
    .getPropertyValue("content");
  if (evalBarAfter !== "none") {
    const evalBarAfterStyle = document.createElement("style");
    evalBarAfterStyle.innerHTML = `
      #evalbar::after {
        content: "${(raport.evals[currentMove] / 100).toFixed(1)}";
        color: #7f7f7f;
        height: calc((${percValue} / 100) * 496px);
      }
    `;
    document.head.appendChild(evalBarAfterStyle);
  }

  if (raport.evals[currentMove] >= 0) {
    const evalBarAfterStyle = document.createElement("style");
    evalBarAfterStyle.innerHTML = `
      #evalbar::after {
        content: "${(raport.evals[currentMove] / 100).toFixed(1)}";
        height: calc((${percValue} / 100) * 496px);
        color: #7f7f7f;
        font-weight: bold;
      }
    `;
    document.head.appendChild(evalBarAfterStyle);
  }

  if (raport.types[currentMove] == "mate" && raport.evals[currentMove] > 0) {
    const evalBarAfterStyle = document.createElement("style");
    evalBarAfterStyle.innerHTML = `
      #evalbar::after {
        content: "M${raport.evals[currentMove]}";
        color: #7f7f7f;
        height: 496px;
      }
    `;
    document.head.appendChild(evalBarAfterStyle);
  }

  if (raport.types[currentMove] == "mate" && raport.evals[currentMove] < 0) {
    const evalBarAfterStyle = document.createElement("style");
    evalBarAfterStyle.innerHTML = `
      #evalbar::after {
        content: "M${raport.evals[currentMove]}";
        height: 0px;
        color: #7f7f7f;
        font-weight: bold;
      }
    `;
    document.head.appendChild(evalBarAfterStyle);
  }
}

function sortAndCalculate(array) {
  let evenIndexes = [];
  let oddIndexes = [];

  let whiteAccVal = 0;
  let blackAccVal = 0;

  for (let i = 0; i < array.length; i++) {
    if (i % 2 === 0) {
      evenIndexes.push(array[i]);
    } else {
      oddIndexes.push(array[i]);
    }
  }

  for (let i = 0; i < evenIndexes.length; i++) {
    if (
      evenIndexes[i] !== "#f7e36d" &&
      evenIndexes[i] !== "#f2c28a" &&
      evenIndexes[i] !== "#f58073"
    ) {
      blackAccVal++;
    }
  }

  for (let i = 0; i < oddIndexes.length; i++) {
    if (
      oddIndexes[i] !== "#f7e36d" &&
      oddIndexes[i] !== "#f2c28a" &&
      oddIndexes[i] !== "#f58073"
    ) {
      whiteAccVal++;
    }
  }

  return {
    evenIndexes: evenIndexes,
    oddIndexes: oddIndexes,
    whiteAccVal: whiteAccVal,
    blackAccVal: blackAccVal,
  };
}

function displayAccuracy() {
  const result = sortAndCalculate(raport.colors);

  whiteAccuracyDiv = document.getElementById("whiteAccuracy");
  whiteAccuracyDiv.innerHTML =
    "White accuracy: " +
    ((result.whiteAccVal / result.evenIndexes.length) * 100).toFixed(1) +
    " %";

  blackAccuracyDiv = document.getElementById("blackAccuracy");
  blackAccuracyDiv.innerHTML =
    "Black accuracy: " +
    ((result.blackAccVal / result.oddIndexes.length) * 100).toFixed(1) +
    " %";

  // Opening
  let openingWhiteDiv = document.querySelector(".openingWhite");
  let openingBlackDiv = document.querySelector(".openingBlack");
  if (raport.playerMoves.length >= 16) {
    openingWhiteDiv.innerHTML =
      ((openingWhiteValue / 8) * 100).toFixed(1) + " %";
  } else {
    openingWhiteDiv.innerHTML =
      ((openingWhiteValue / (openingMoveCoutner / 2)) * 100).toFixed(1) + " %";
  }

  if (raport.playerMoves.length >= 16) {
    openingBlackDiv.innerHTML =
      ((openingBlackValue / 8) * 100).toFixed(1) + " %";
  } else {
    openingBlackDiv.innerHTML =
      ((openingBlackValue / (openingMoveCoutner / 2)) * 100).toFixed(1) + " %";
  }

  // Middlegame
  let middlegameWhiteDiv = document.querySelector(".middlegameWhite");
  let middlegameBlackDiv = document.querySelector(".middlegameBlack");
  if (middlegameTrigger == true) {
    middlegameWhiteDiv.innerHTML =
      ((middlegameWhiteValue / (middlegameMoveCoutner / 2)) * 100).toFixed(1) +
      " %";

    middlegameBlackDiv.innerHTML =
      ((middlegameBlackValue / (middlegameMoveCoutner / 2)) * 100).toFixed(1) +
      " %";
  } else {
    middlegameWhiteDiv.innerHTML = "    -   ";
    middlegameBlackDiv.innerHTML = "    -   ";
  }

  // Endgame
  let endgameWhiteDiv = document.querySelector(".endgameWhite");
  let endgameBlackDiv = document.querySelector(".endgameBlack");
  if (endgameTrigger == true) {
    endgameWhiteDiv.innerHTML =
      ((endgameWhiteValue / (endgameMoveCoutner / 2)) * 100).toFixed(1) + " %";

    endgameBlackDiv.innerHTML =
      ((endgameBlackValue / (endgameMoveCoutner / 2)) * 100).toFixed(1) + " %";
  } else {
    endgameWhiteDiv.innerHTML = "    -   ";
    endgameBlackDiv.innerHTML = "    -   ";
  }
}

function checkResult() {
  let result = raport.pgn[raport.pgn.length - 2];
  let formattedResult;
  if (result === "1-0") {
    formattedResult =
      '<span style="color: #FFD700;"><b>White Wins!</b></span></br><div id="displayMoves" style="color: #FFD700;"><b>black resigned</b></div>';
  } else if (result === "0-1") {
    formattedResult =
      '<span style="color: #FFD700;"><b>Black Wins!</b></span></br><div id="displayMoves" style="color: #FFD700;"><b>white resigned</b></div>';
  } else if (result === "1/2-1/2") {
    formattedResult = '<span style="color: #FFD700;"><b>Draw</b></span>';
  }

  return formattedResult;
}

// Game review
function gameReview(direction) {
  let playerMove = raport.playerMoves[currentMove + 1];
  let curentColor = raport.colors[currentMove + 1];

  if (direction === "forward" && currentMove < pgn.length - 2) {
    currentMove++;
  } else if (direction === "backward" && currentMove > 0) {
    currentMove--;
  }
  board.position(raport.fen[currentMove]);
  displayComment();
  displayEvalbar();
  fillEvalbar();
  checkResult();
  paintSquares(playerMove, curentColor);
}

class Stockfish {
  constructor() {
    this.worker = new Worker(
      typeof WebAssembly == "object"
        ? "stockfish/stockfish-nnue-16.js"
        : "stockfish/stockfish.js"
    );
    this.depth = 0;
    this.worker.postMessage("uci");
    this.worker.postMessage("setoption name MultiPV value 0");
    return;
  }

  async evaluate(fen, targetDepth, verbose = false) {
    return new Promise((resolve, reject) => {
      const messages = [];
      const lines = [];
      let timeoutReached = false;
      let latestDepth = 0;

      const timeout = setTimeout(() => {
        timeoutReached = true;
        reject("Evaluation timeout reached");
        this.worker.terminate();
      }, 60000);

      this.worker.addEventListener("message", (event) => {
        if (timeoutReached) return;

        let message = event.data;
        messages.unshift(message);

        if (message.startsWith("bestmove") || message.includes("depth 0")) {
          for (let i = 0; i < messages.length; i++) {
            let searchMessage = messages[i];
            let idString = searchMessage.match(/(?:multipv )(\d+)/)?.[1];
            let depthString = searchMessage.match(/(?:depth )(\d+)/)?.[1];
            let moveUCI = searchMessage.match(/(?: pv )(.+?)(?= |$)/)?.[1];
            let evaluation = {
              type: searchMessage.includes(" cp ") ? "cp" : "mate",
              value: parseInt(
                searchMessage.match(/(?:(?:cp )|(?:mate ))([\d-]+)/)?.[1] || "0"
              ),
            };

            if (fen.includes(" b ")) {
              evaluation.value *= -1;
            }
            if (!idString || !depthString || !moveUCI) continue;
            let id = parseInt(idString);
            let depth = parseInt(depthString);
            if (!lines.some((line) => line.moveUCI === moveUCI)) {
              lines.push({
                id,
                depth,
                evaluation,
                moveUCI,
              });
            }
          }
          if (lines.length >= 1 || timeoutReached) {
            clearTimeout(timeout);
            this.worker.terminate();
            resolve(lines);
          }
        }
      });

      this.worker.addEventListener("error", () => {
        clearTimeout(timeout);
        this.worker.terminate();
        this.worker = new Worker("stockfish/stockfish.js");
        this.worker.postMessage("uci");
        this.worker.postMessage("setoption name MultiPV value 0");
        this.evaluate(fen, targetDepth, verbose).then(resolve).catch(reject);
      });

      this.worker.postMessage("position fen " + fen);
      this.worker.postMessage("go depth " + targetDepth);
    });
  }

  async generateBestPositions(fen, numLines, depth) {
    const engineLines = await this.evaluate(fen, depth);
    return engineLines.slice(0, numLines);
  }
}

async function removeAllPaintedSquares() {
  let lightSquares = document.querySelectorAll(".white-1e1d7");
  let darkSquares = document.querySelectorAll(".black-3c85d");
  const iconElements = document.querySelectorAll(".icon");

  iconElements.forEach((i) => {
    i.remove();
  });

  lightSquares.forEach((ls) => {
    ls.style.background = "";
    ls.style.border = "none";
    ls.style.opacity = "1";
  });
  darkSquares.forEach((ds) => {
    ds.style.background = "";
    ds.style.border = "none";
    ds.style.opacity = "1";
  });

  // Default "blue"
  if (theme == "default") {
    lightSquares.forEach((ls) => {
      ls.style.background = "";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "";
    });
  }
  // Red
  else if (theme == "red") {
    lightSquares.forEach((ls) => {
      ls.style.background = "#e6c8cf";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#e8829a";
    });
  }
  // Tournament
  else if (theme == "tournament") {
    lightSquares.forEach((ls) => {
      ls.style.background = "#cee9cc";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#7db37e";
    });
  }
  // Classic
  else if (theme == "classic") {
    lightSquares.forEach((ls) => {
      ls.style.background = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#BE8F68";
    });
  }
  // Glass
  else if (theme == "glass") {
    lightSquares.forEach((ls) => {
      ls.style.background = "#F0F1F0";
    });
    darkSquares.forEach((ds) => {
      ds.style.background = "#C4D8E4";
    });
  }
}

let evalArr = [0];
let evalArr2 = [0];
let typeArr = ["cp"];

let bestMovesArr = ["e2e4"];
let secondBestMovesArr = ["d2d4"];
let thirdBestMovesArr = ["c2c4"];

let bestMovesArrEval = ["0.2"];
let secondBestMovesArrEval = ["0.1"];
let thirdBestMovesArrEval = ["0.0"];

let veryGoodMovesArr = [""];
let goodMovesArr = [""];

async function DisplayBestPositions(fen, stockfish, depth, pgnClone) {
  return new Promise((resolve, reject) => {
    const numLines = 8;
    stockfish
      .generateBestPositions(fen, numLines, depth)
      .then(async (analyses) => {
        const sortedAnalyses = analyses.sort((a, b) => a.id - b.id);

        removeAllPaintedSquares();

        const lastMove = game.history({ verbose: true }).pop();

        const playerMove = getMoveNotation(lastMove);
        const evalsArr = sortedAnalyses.map(
          (analysis) => analysis.evaluation.value
        );
        const { moveEvaluationText, textColor, colorSquare } =
          evaluateAndCheckMove(
            playerMove,
            fen,
            evalsArr,
            sortedAnalyses,
            pgnClone,
            lastMove
          );
        const { moveEvaluationText: updatedText, textColor: updatedTextColor } =
          checkBestMove(
            moveEvaluationText,
            textColor,
            sortedAnalyses,
            lastMove
          );
        resolve(analyses);
      })
      .catch((error) => {
        reject(error);
      });
  });

  function getMoveNotation(move) {
    const fromSquare = move.from;
    const toSquare = move.to;
    return fromSquare + toSquare;
  }

  function checkBestMove(moveEvaluationText, textColor, analyses, lastMove) {
    let currentPlayerMove = lastMove.from + lastMove.to;

    // First
    let engineBestMove = bestMovesArr[bestMovesArr.length - 1];
    let engineBestMoveEval = (
      bestMovesArrEval[bestMovesArrEval.length - 1] / 100
    ).toFixed(1);

    let engineVeryGoodMove = veryGoodMovesArr[veryGoodMovesArr.length - 1];
    let engineGoodMove = goodMovesArr[goodMovesArr.length - 1];

    bestMovesArr.push(analyses[0].moveUCI);
    bestMovesArr.push(analyses[0].moveUCI);
    bestMovesArrEval.push(analyses[0].evaluation.value);
    bestMovesArrEval.push(analyses[0].evaluation.value);

    if (analyses.length >= 3) {
      veryGoodMovesArr.push(analyses[1].moveUCI + ", " + analyses[2].moveUCI);
    }
    if (analyses.length >= 5) {
      goodMovesArr.push(analyses[3].moveUCI + ", " + analyses[4].moveUCI);
    }
    if (analyses.length >= 6) {
      goodMovesArr.push(
        analyses[3].moveUCI +
          ", " +
          analyses[4].moveUCI +
          ", " +
          analyses[5].moveUCI
      );
    }
    if (analyses.length >= 7) {
      goodMovesArr.push(
        analyses[3].moveUCI +
          ", " +
          analyses[4].moveUCI +
          ", " +
          analyses[5].moveUCI +
          ", " +
          analyses[6].moveUCI
      );
    }
    if (analyses.length >= 8) {
      goodMovesArr.push(
        analyses[3].moveUCI +
          ", " +
          analyses[4].moveUCI +
          ", " +
          analyses[5].moveUCI +
          ", " +
          analyses[6].moveUCI +
          ", " +
          analyses[7].moveUCI
      );
    }

    raport.playerMoves.push(currentPlayerMove);
    raport.bestMoves.push(analyses[0].moveUCI);

    let moves = "";
    let whiteMoves = "";
    let blackMoves = "";
    let accurateTolerance = 5;
    for (let i = 0; i < analyses.length - 1; i++) {
      if (i < accurateTolerance) {
        moves += analyses[i].moveUCI + ", ";

        if (isEven(i)) {
          blackMoves += analyses[i].moveUCI + ", ";
        } else {
          whiteMoves += analyses[i].moveUCI + ", ";
        }
      }
    }
    accurateMoves.push(moves);
    whiteAccMoves.push(whiteMoves);
    blackAccMoves.push(blackMoves);

    const displayMovesDiv = document.getElementById("displayMoves");
    

    if (currentPlayerMove == engineBestMove) {
      displayMovesDiv.textContent = engineBestMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #97cc64;"><div style="color:#fff">${engineBestMove} | ${engineBestMoveEval}</div>
       is the best move!</div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else if (engineVeryGoodMove.includes(currentPlayerMove)) {
      let LastEvalNumber = (evalArr.pop() / 100).toFixed(1)
      displayMovesDiv.textContent = engineVeryGoodMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #90c959;">${currentPlayerMove} | ${LastEvalNumber} is very good move!</div>
      <div id="displayMoves" style="color: #97cc64;">The best was: <span style="color:#fff">${engineBestMove} | ${engineBestMoveEval}</span></div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else if (engineGoodMove.includes(currentPlayerMove)) {
      let LastEvalNumber = (evalArr.pop() / 100).toFixed(1)
      displayMovesDiv.textContent = engineGoodMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #a5c983;">${currentPlayerMove} | ${LastEvalNumber} is a good move!</div>
      <div id="displayMoves" style="color: #97cc64;">The best was: <span style="color:#fff"> ${engineBestMove} | ${engineBestMoveEval}</span></div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else {
      let LastEvalNumber = (evalArr.pop() / 100).toFixed(1)
      displayMovesDiv.textContent = engineBestMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: ${textColor};">Move played: ${currentPlayerMove} | ${LastEvalNumber}</div>
      <div id="displayMoves" style="color: #97cc64;">The best was: <span style="color:#fff">${engineBestMove} | ${engineBestMoveEval}</span></div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    }

    // Second
    if (analyses.length >= 2) {
      secondBestMovesArr.push(analyses[1].moveUCI);
      secondBestMovesArr.push(analyses[1].moveUCI);
      secondBestMovesArrEval.push(analyses[1].evaluation.value);
      secondBestMovesArrEval.push(analyses[1].evaluation.value);
    }

    // Third
    if (analyses.length >= 3) {
      secondBestMovesArr.push(analyses[1].moveUCI);
      secondBestMovesArr.push(analyses[1].moveUCI);
      secondBestMovesArrEval.push(analyses[1].evaluation.value);
      secondBestMovesArrEval.push(analyses[1].evaluation.value);

      thirdBestMovesArr.push(analyses[2].moveUCI);
      thirdBestMovesArr.push(analyses[2].moveUCI);
      thirdBestMovesArrEval.push(analyses[2].evaluation.value);
      thirdBestMovesArrEval.push(analyses[2].evaluation.value);
    }

    return { moveEvaluationText, textColor };
  }

  function evaluateAndCheckMove(
    playerMove,
    fen,
    evalsArr,
    analyses,
    pgnClone,
    lastMove
  ) {
    let currentPlayerMove = lastMove.from + lastMove.to;
    let engineBestMove = bestMovesArr[bestMovesArr.length - 1];
    let engineVeryGoodMove = veryGoodMovesArr[veryGoodMovesArr.length - 1];
    let engineGoodMove = goodMovesArr[goodMovesArr.length - 1];

    // Colors
    let brilliant = "#8ff7e3";
    let great = "#76acde";
    let book = "#deb18e";
    let best = "#97cc64";
    let veryGood = "#90c959";
    let good = "#a5c983";
    let inacuraccy = "#f7e36d";
    let mistake = "#f2c28a";
    let blunder = "#f58073";

    let currMoveValue = analyses[0].evaluation.value;
    let currMoveType = analyses[0].evaluation.type;
    evalArr.push(currMoveValue);
    typeArr.push(currMoveType);

    if (analyses.length > 1) {
      let currMoveValue2 = analyses[1].evaluation.value;
      evalArr2.push(currMoveValue2);
      currMove2 = currMoveValue2;
    }

    raport.evals.push(currMoveValue);
    raport.types.push(currMoveType);

    let currMove = currMoveValue;

    let prevMove = evalArr[evalArr.length - 2];

    let moveEvaluationText;
    let textColor;
    let colorSquare;

    checkIfBookMove();

    // For white
    if (fen.includes(" b ")) {
      if (engineBestMove.includes(currentPlayerMove)) {
        moveEvaluationText = "Best move!";
        textColor = best;
        colorSquare = best;
      } else if (
        (currMove >= prevMove &&
          currMove - prevMove >= 20 &&
          currMove - prevMove < 100) ||
        engineVeryGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Very good move";
        textColor = veryGood;
        colorSquare = veryGood;
      } else if (
        (currMove >= prevMove &&
          currMove - prevMove >= 0 &&
          currMove - prevMove < 20) ||
        engineGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove >= 0 &&
        prevMove - currMove < 25
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove >= 25 &&
        prevMove - currMove < 150
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove >= 150 &&
        prevMove - currMove < 275
      ) {
        moveEvaluationText = "Mistake";
        textColor = mistake;
        colorSquare = mistake;
      } else if (currMove <= prevMove && prevMove - currMove > 275) {
        moveEvaluationText = "Blunder";
        textColor = blunder;
        colorSquare = blunder;
      }
      // Check if Great or Brilliant
      if (analyses[0].evaluation.type == "cp") {
        if (
          currMove >= prevMove &&
          currMove - prevMove >= 100 &&
          currMove - prevMove < 200 &&
          currMove > -500 &&
          currMove < 500
        ) {
          moveEvaluationText = "Great move!";
          textColor = great;
          colorSquare = great;
        }
        if (
          currMove >= prevMove &&
          currMove - prevMove > 200 &&
          currMove > -500 &&
          currMove < 500
        ) {
          moveEvaluationText = "Excellent move!";
          textColor = brilliant;
          colorSquare = brilliant;
        }
      }

      if (bookMove == true) {
        moveEvaluationText = "Book move!";
        textColor = book;
        colorSquare = book;
      }

      // For black
    } else if (fen.includes(" w ")) {
      if (engineBestMove.includes(currentPlayerMove)) {
        moveEvaluationText = "Best move!";
        textColor = best;
        colorSquare = best;
      } else if (
        (currMove <= prevMove &&
          prevMove - currMove >= 20 &&
          prevMove - currMove < 100) ||
        engineVeryGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Very good move";
        textColor = veryGood;
        colorSquare = veryGood;
      } else if (
        (currMove <= prevMove &&
          prevMove - currMove >= 0 &&
          prevMove - currMove < 20) ||
        engineGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove >= 0 &&
        currMove - prevMove < 25
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove >= 25 &&
        currMove - prevMove < 150
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove >= 150 &&
        currMove - prevMove < 275
      ) {
        moveEvaluationText = "Mistake";
        textColor = mistake;
        colorSquare = mistake;
      } else if (currMove >= prevMove && currMove - prevMove > 275) {
        moveEvaluationText = "Blunder";
        textColor = blunder;
        colorSquare = blunder;
      }
      // Check if Great or Brilliant
      if (analyses[0].evaluation.type == "cp") {
        if (
          currMove <= prevMove &&
          prevMove - currMove >= 100 &&
          prevMove - currMove < 200 &&
          currMove > -500 &&
          currMove < 500
        ) {
          moveEvaluationText = "Great move!";
          textColor = great;
          colorSquare = great;
        }
        if (
          currMove <= prevMove &&
          prevMove - currMove > 200 &&
          currMove > -500 &&
          currMove < 500
        ) {
          moveEvaluationText = "Excellent move!";
          textColor = brilliant;
          colorSquare = brilliant;
        }
      }

      if (bookMove == true) {
        moveEvaluationText = "Book move!";
        textColor = book;
        colorSquare = book;
      }
    }

    if (analyses[0].evaluation.type == "mate") {
      if (fen.includes(" w ")) {
        if (currMove > prevMove) {
          moveEvaluationText = "Good move";
          textColor = good;
          colorSquare = good;
        } else if (currMove <= prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
        }
      } else if (fen.includes(" b ")) {
        if (currMove < prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
        } else if (currMove > prevMove) {
          moveEvaluationText = "Good move";
          textColor = good;
          colorSquare = good;
        }
      }
    }

    const moveEvaluationDiv = document.getElementById("moveEvaluation");
    moveEvaluationDiv.textContent = moveEvaluationText;
    moveEvaluationDiv.innerHTML = `<span style="color: ${textColor};"><b>${moveEvaluationText}</b></span>`;

    raport.colors.push(textColor);
    raport.message.push(moveEvaluationDiv.innerHTML);

    return { moveEvaluationText, textColor, colorSquare };
  }
}
