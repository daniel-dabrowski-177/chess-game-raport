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
      ls.style.backgroundColor = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "#BE8F68";
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

    console.log(newFen);

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

        let positionEvaluationDiv = document.querySelector(
          ".positionEvaluation"
        );
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
        }

        removeAllPaintedSquares();

        let lightSquares = document.querySelectorAll(".white-1e1d7");
        let darkSquares = document.querySelectorAll(".black-3c85d");
        lightSquares.forEach((ls) => {
          ls.style.backgroundColor = "#FCE4BE";
        });
        darkSquares.forEach((ds) => {
          ds.style.backgroundColor = "#BE8F68";
        });

        // third move
        let thirdMoveFrom = sortedAnalyses[2].moveUCI.substring(0, 2);
        let thirdMoveTo = sortedAnalyses[2].moveUCI.substring(2);
        const thirdSquareFrom = document.querySelector(
          `[data-square=${thirdMoveFrom}]`
        );
        const thirdSquareTo = document.querySelector(
          `[data-square=${thirdMoveTo}]`
        );
        thirdSquareFrom.style.backgroundColor = "#2D6585";
        thirdSquareTo.style.backgroundColor = "#2D6585";

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
        secondSquareFrom.style.backgroundColor = "#3D856F";
        secondSquareTo.style.backgroundColor = "#3D856F";

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
        topSquareFrom.style.backgroundColor = "#537B2F";
        topSquareTo.style.backgroundColor = "#537B2F";

        let topMoveClassificationDiv = document.createElement("div");
        topMoveClassificationDiv.classList.add("icon");
        topMoveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
        topSquareTo.appendChild(topMoveClassificationDiv);
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
    body.style.backgroundColor = "#262421";
    boardStyle.style.border = "6px solid #ff0000";
    boardStyle.style.padding = "0 0 -4px 0";

    generalRaport.style.margin = "100px 0 0";
    moreDetails.style.margin = "100px 0 0";
    evalbar.style.margin = "100px 20px";

    button.forEach((btn) => {
      btn.style.backgroundColor = "#7e5634";
    });

    lightSquares.forEach((ls) => {
      ls.style.backgroundColor = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "#BE8F68";
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
      default:
        "default";
        themeDefault.click();
        break;
    }
  } else if (showAnalise) {
    onDrop();
  }
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
  } else if (event.key === "e") {
    let bestMoveAsistantBtn = document.getElementById("bestMoveAsistantBtn");
    showEngineBestMoves = !showEngineBestMoves;
    $("#reviewBtnBackward").trigger("click");
    $("#reviewBtnForward").trigger("click");
    if (showEngineBestMoves) {
      bestMoveAsistantBtn.textContent = `Engine Moves: yes`;
    } else {
      bestMoveAsistantBtn.textContent = `Engine Moves: no`;
    }
  } else if (event.key === "q") {
    $("#analiseCurrentPossitionBtn").trigger("click");
  } else if (event.key === "f") {
    $("#flipOrientationBtn").trigger("click");
  }
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
              blackAccVal++;

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
              whiteAccVal++;

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
      pgnStatusDiv.style.color = "#a17a5c";
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
        squareFrom.style.backgroundColor = "#a17a5c";
        squareTo.style.backgroundColor = "#a17a5c";

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        moveClassificationDiv.style.backgroundImage = `url("/move_classifications/book.png")`;

        squareTo.appendChild(moveClassificationDiv);

        let displayMovesDiv = document.getElementById("displayMoves");
        const moveEvaluationDiv = document.getElementById("moveEvaluation");
        displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #a17a5c;">${openingName}</div>`;
        moveEvaluationDiv.innerHTML = `<span style="color: #a17a5c;"><b>Book Move</b></span>`;
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
        squareFrom.style.backgroundColor = curentColor;
        squareTo.style.backgroundColor = curentColor;

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        switch (curentColor) {
          case "#1f947d":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/brilliant.png")`;
            break;
          case "#5183b0":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/great.png")`;
            break;
          case "#71a341":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            break;
          case "#71a340":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
            break;
          case "#95b776":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
            break;
          case "#d9af32":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
            break;
          case "#e07c16":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
            break;
          case "#d63624":
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
        squareFrom.style.backgroundColor = curentColor;
        squareTo.style.backgroundColor = curentColor;

        let moveClassificationDiv = document.createElement("div");
        moveClassificationDiv.classList.add("icon");

        // Validation
        switch (curentColor) {
          case "#71a341":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/best.png")`;
            break;
          case "#71a340":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/very-good.png")`;
            break;
          case "#95b776":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/good.png")`;
            break;
          case "#d9af32":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/inaccuracy.png")`;
            break;
          case "#e07c16":
            moveClassificationDiv.style.backgroundImage = `url("/move_classifications/mistake.png")`;
            break;
          case "#d63624":
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
        squareFrom.style.backgroundColor = "#4d702c";
        squareTo.style.backgroundColor = "#4d702c";

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
      squareFrom.style.backgroundColor = "#c96157";
      squareTo.style.backgroundColor = "#c96157";

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
      if (raport.colors[i] == "#1f947d") {
        excellentCounterBlack++;
        excellentCounterBlackDiv.textContent = excellentCounterBlack;
      }
      if (raport.colors[i] == "#5183b0") {
        greatCounterBlack++;
        greatCounterBlackDiv.textContent = greatCounterBlack;
      }
      if (raport.colors[i] == "#71a341") {
        bestCounterBlack++;
        bestCounterBlackDiv.textContent = bestCounterBlack;
      }
      if (raport.colors[i] == "#71a340") {
        veryGoodCounterBlack++;
        veryGoodCounterBlackDiv.textContent = veryGoodCounterBlack;
      }
      if (raport.colors[i] == "#95b776") {
        goodCounterBlack++;
        goodCounterBlackDiv.textContent = goodCounterBlack;
      }
      if (raport.colors[i] == "#a17a5c") {
        bookCounterBlack++;
        bookCounterBlackDiv.textContent = bookCounterBlack;
      }
      if (raport.colors[i] == "#d9af32") {
        inaccuracyCounterBlack++;
        inaccuracyCounterBlackDiv.textContent = inaccuracyCounterBlack;
      }
      if (raport.colors[i] == "#e07c16") {
        mistakeCounterBlack++;
        mistakeCounterBlackDiv.textContent = mistakeCounterBlack;
      }
      if (raport.colors[i] == "#d63624") {
        blunderCounterBlack++;
        blunderCounterBlackDiv.textContent = blunderCounterBlack;
      }
    } else {
      if (raport.colors[i] == "#1f947d") {
        excellentCounterWhite++;
        excellentCounterWhiteDiv.textContent = excellentCounterWhite;
      }
      if (raport.colors[i] == "#5183b0") {
        greatCounterWhite++;
        greatCounterWhiteDiv.textContent = greatCounterWhite;
      }
      if (raport.colors[i] == "#71a341") {
        bestCounterWhite++;
        bestCounterWhiteDiv.textContent = bestCounterWhite;
      }
      if (raport.colors[i] == "#71a340") {
        veryGoodCounterWhite++;
        veryGoodCounterWhiteDiv.textContent = veryGoodCounterWhite;
      }
      if (raport.colors[i] == "#95b776") {
        goodCounterWhite++;
        goodCounterWhiteDiv.textContent = goodCounterWhite;
      }
      if (raport.colors[i] == "#a17a5c") {
        bookCounterWhite++;
        bookCounterWhiteDiv.textContent = bookCounterWhite;
      }
      if (raport.colors[i] == "#d9af32") {
        inaccuracyCounterWhite++;
        inaccuracyCounterWhiteDiv.textContent = inaccuracyCounterWhite;
      }
      if (raport.colors[i] == "#e07c16") {
        mistakeCounterWhite++;
        mistakeCounterWhiteDiv.textContent = mistakeCounterWhite;
      }
      if (raport.colors[i] == "#d63624") {
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

function displayAccuracy() {
  whiteAccuracyDiv = document.getElementById("whiteAccuracy");
  whiteAccuracyDiv.innerHTML =
    "White accuracy: " +
    ((whiteAccVal / (raport.playerMoves.length / 2)) * 100).toFixed(1) +
    " %";

  blackAccuracyDiv = document.getElementById("blackAccuracy");
  blackAccuracyDiv.innerHTML =
    "Black accuracy: " +
    ((blackAccVal / (raport.playerMoves.length / 2)) * 100).toFixed(1) +
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
    this.worker.postMessage("setoption name MultiPV value 8");
    return;
  }

  async evaluate(fen, targetDepth, verbose = false) {
    this.worker.postMessage("position fen " + fen);
    this.worker.postMessage("go depth " + targetDepth);
    const messages = [];
    const lines = [];
    let timeoutReached = false;
    return new Promise((res) => {
      const timeout = setTimeout(() => {
        timeoutReached = true;
        res(lines);
        this.worker.terminate();
      }, 60000);

      this.worker.addEventListener("message", (event) => {
        if (timeoutReached) return;
        let message = event.data;
        messages.unshift(message);
        let latestDepth = parseInt(
          message.match(/(?:depth )(\d+)/)?.[1] || "0"
        );
        this.depth = Math.max(latestDepth, this.depth);
        if (message.startsWith("bestmove") || message.includes("depth 0")) {
          let searchMessages = messages.filter((msg) =>
            msg.startsWith("info depth")
          );
          const uniqueMovesMap = new Map();
          for (let searchMessage of searchMessages) {
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
            if (!uniqueMovesMap.has(moveUCI)) {
              uniqueMovesMap.set(moveUCI, {
                id,
                depth,
                evaluation,
                moveUCI,
              });
            }
          }
          lines.push(...uniqueMovesMap.values());
          if (lines.length >= 1 || timeoutReached) {
            clearTimeout(timeout);
            this.worker.terminate();
            res(lines);
          }
        }
      });
      this.worker.addEventListener("error", () => {
        clearTimeout(timeout);
        this.worker.terminate();
        this.worker = new Worker("stockfish/stockfish.js");
        this.worker.postMessage("uci");
        this.worker.postMessage("setoption name MultiPV value 8");
        this.evaluate(fen, targetDepth, verbose).then(res);
      });
    });
    return;
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
    ls.style.backgroundColor = "";
    ls.style.border = "none";
    ls.style.opacity = "1";
  });
  darkSquares.forEach((ds) => {
    ds.style.backgroundColor = "";
    ds.style.border = "none";
    ds.style.opacity = "1";
  });

  // Default "blue"
  if (theme == "default") {
    lightSquares.forEach((ls) => {
      ls.style.backgroundColor = "";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "";
    });
  }
  // Red
  else if (theme == "red") {
    lightSquares.forEach((ls) => {
      ls.style.backgroundColor = "#e6c8cf";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "#e8829a";
    });
  }
  // Tournament
  else if (theme == "tournament") {
    lightSquares.forEach((ls) => {
      ls.style.backgroundColor = "#E9E9E5";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "#316549";
    });
  }
  // Classic
  else if (theme == "classic") {
    lightSquares.forEach((ls) => {
      ls.style.backgroundColor = "#FCE4BE";
    });
    darkSquares.forEach((ds) => {
      ds.style.backgroundColor = "#BE8F68";
    });
  }
}

let evalArr = [0];
let evalArr2 = [0];
let typeArr = ["cp"];
let bestMovesArr = ["e2e4"];
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
    let engineBestMove = bestMovesArr[bestMovesArr.length - 1];
    let engineVeryGoodMove = veryGoodMovesArr[veryGoodMovesArr.length - 1];
    let engineGoodMove = goodMovesArr[goodMovesArr.length - 1];

    bestMovesArr.push(analyses[0].moveUCI);

    bestMovesArr.push(analyses[0].moveUCI);

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
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #71a341;"> ${engineBestMove} is the best move!</div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else if (engineVeryGoodMove.includes(currentPlayerMove)) {
      displayMovesDiv.textContent = engineVeryGoodMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #71a340;">${currentPlayerMove} is very good move!</div>
      <div id="displayMoves" style="color: #71a341;">The best was: ${engineBestMove}</div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else if (engineGoodMove.includes(currentPlayerMove)) {
      displayMovesDiv.textContent = engineGoodMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: #95b776;">${currentPlayerMove} is a good move!</div>
      <div id="displayMoves" style="color: #71a341;">The best was: ${engineBestMove}</div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
    } else {
      displayMovesDiv.textContent = engineBestMove;
      displayMovesDiv.innerHTML = `<div id="displayMoves" style="color: ${textColor};">Move played: ${currentPlayerMove}</div>
      <div id="displayMoves" style="color: #71a341;">The best was: ${engineBestMove}</div>`;
      raport.comment.push(displayMovesDiv.innerHTML);
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
    let brilliant = "#1f947d";
    let great = "#5183b0";
    let book = "#a17a5c";
    let best = "#71a341";
    let veryGood = "#71a340";
    let good = "#95b776";
    let inacuraccy = "#d9af32";
    let mistake = "#e07c16";
    let blunder = "#d63624";

    let currMoveValue = analyses[0].evaluation.value;
    let currMoveType = analyses[0].evaluation.type;
    evalArr.push(currMoveValue);
    typeArr.push(currMoveType);

    let currMove2;

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
        prevMove - currMove < 100
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove >= 100 &&
        prevMove - currMove < 250
      ) {
        moveEvaluationText = "Mistake";
        textColor = mistake;
        colorSquare = mistake;
      } else if (currMove <= prevMove && prevMove - currMove > 250) {
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
        currMove - prevMove < 100
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove >= 100 &&
        currMove - prevMove < 250
      ) {
        moveEvaluationText = "Mistake";
        textColor = mistake;
        colorSquare = mistake;
      } else if (currMove >= prevMove && currMove - prevMove > 250) {
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
