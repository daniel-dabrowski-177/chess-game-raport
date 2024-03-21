let game = new Chess();

function stringToMoveArray(pgnStr) {
  const [metadata, moves] = pgnStr.trim().split(/\n\n/);
  const movesArray = moves.replace(/\d+\.\s/g, "").split(/\s/);

  // Extract information from metadata
  function extractInfo(metadata, tag) {
    let regex = new RegExp("\\[" + tag + ' "(.*?)"\\]');
    let match = metadata.match(regex);
    return match ? match[1] : null;
  }

  // Extracting required information
  let whitePlayer = extractInfo(metadata, "White");
  let blackPlayer = extractInfo(metadata, "Black");
  let whiteElo = extractInfo(metadata, "WhiteElo");
  let blackElo = extractInfo(metadata, "BlackElo");
  let timeControl = extractInfo(metadata, "TimeControl");

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

  let whitePlayerDiv = document.getElementById("whitePlayer");
  let blackPlayerDiv = document.getElementById("blackPlayer");
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
  orientation: "white",
  pieceTheme: `chesspieces/${piecesSet}/{piece}.png`,
});

let flipOrientationBtn = document.getElementById("flipOrientationBtn");
flipOrientationBtn.addEventListener("click", () => {
  board.flip();
  removeAllPaintedSquares();
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
let bookMove = false;
let openingName;

let bestMoveAsistantBtn = document.getElementById("bestMoveAsistantBtn");
bestMoveAsistantBtn.addEventListener("click", () => {
  showEngineBestMoves = !showEngineBestMoves;
  if (showEngineBestMoves) {
    bestMoveAsistantBtn.textContent = `Engine Moves: yes`;
  } else {
    bestMoveAsistantBtn.textContent = `Engine Moves: no`;
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
  } else if (event.key === "ArrowRight") {
    gameReview("forward");
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
    console.log("PGN confirmed. Starting game...");
    pgnStatus.textContent = `PGN loaded successfully`;
  } else {
    console.log("Invalid PGN input.");
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

        return (currentMove = 0);
      } else {
        if (i >= 2) {
          if (accurateMoves[i - 1].includes(raport.playerMoves[i])) {
            accuracyValue++;
            if (isEven(i)) {
              blackAccVal++;
            } else {
              whiteAccVal++;
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
  for (let i = 0; i < eco.length; i++) {
    if (eco[i].moves === raport.pgnMoves[currentMove]) {
      bookMove = true;
      openingName = eco[i].name;
      console.log(openingName);
      return;
    }
  }

  bookMove = false;
  console.log("not found");
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
    if (raport.playerMoves[currentMove]) {
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
        height: calc((${percValue} / 100) * 496px);
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
    "%";

  blackAccuracyDiv = document.getElementById("blackAccuracy");
  blackAccuracyDiv.innerHTML =
    "Black accuracy: " +
    ((blackAccVal / (raport.playerMoves.length / 2)) * 100).toFixed(1) +
    "%";
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

        resolve();
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

    raport.evals.push(currMoveValue);
    raport.types.push(currMoveType);

    let currMove = currMoveValue;
    let prevMove = evalArr[evalArr.length - 2];

    let currType = currMoveType;
    let prevType = typeArr[evalArr.length - 2];

    let moveEvaluationText;
    let textColor;
    let colorSquare;

    const whiteDiff = currMove - prevMove;
    const blackDiff = prevMove - currMove;

    // For white
    if (fen.includes(" b ")) {
      if (
        (currMove >= prevMove &&
          currMove - prevMove >= 0 &&
          currMove - prevMove < 20) ||
        engineGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        (currMove >= prevMove &&
          currMove - prevMove >= 20 &&
          currMove - prevMove < 350) ||
        engineVeryGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Very good move";
        textColor = veryGood;
        colorSquare = veryGood;
      } else if (engineBestMove.includes(currentPlayerMove)) {
        moveEvaluationText = "Best move!";
        textColor = best;
        colorSquare = best;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove >= 350 &&
        currMove - prevMove < 550
      ) {
        moveEvaluationText = "Great move!";
        textColor = great;
        colorSquare = great;
      } else if (currMove >= prevMove && currMove - prevMove < 550) {
        moveEvaluationText = "Excellent move!";
        textColor = brilliant;
        colorSquare = brilliant;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove > 0 &&
        prevMove - currMove < 100
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove > 100 &&
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
      // For black
    } else if (fen.includes(" w ")) {
      if (
        (currMove <= prevMove && prevMove - currMove < 20) ||
        engineGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Good move";
        textColor = good;
        colorSquare = good;
      } else if (
        (currMove <= prevMove &&
          prevMove - currMove >= 20 &&
          prevMove - currMove < 350) ||
        engineVeryGoodMove.includes(currentPlayerMove)
      ) {
        moveEvaluationText = "Very good move";
        textColor = veryGood;
        colorSquare = veryGood;
      } else if (engineBestMove.includes(currentPlayerMove)) {
        moveEvaluationText = "Best move!";
        textColor = best;
        colorSquare = best;
      } else if (
        currMove <= prevMove &&
        prevMove - currMove >= 350 &&
        prevMove - currMove < 550
      ) {
        moveEvaluationText = "Great move!";
        textColor = great;
        colorSquare = great;
      } else if (currMove <= prevMove && prevMove - currMove > 550) {
        moveEvaluationText = "Excellent move!";
        textColor = brilliant;
        colorSquare = brilliant;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove > 0 &&
        currMove - prevMove <= 100
      ) {
        moveEvaluationText = "Inacuraccy";
        textColor = inacuraccy;
        colorSquare = inacuraccy;
      } else if (
        currMove >= prevMove &&
        currMove - prevMove > 100 &&
        currMove - prevMove <= 250
      ) {
        moveEvaluationText = "Mistake";
        textColor = mistake;
        colorSquare = mistake;
      } else if (currMove >= prevMove && currMove - prevMove > 250) {
        moveEvaluationText = "Blunder";
        textColor = blunder;
        colorSquare = blunder;
      }
    }

    if (analyses[0].evaluation.type == "mate") {
      if (fen.includes(" w ")) {
        if (currMove > prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
        } else if (currMove <= prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
        }
      } else if (fen.includes(" b ")) {
        if (currMove < prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
        } else if (currMove > prevMove) {
          moveEvaluationText = "Mate in: " + analyses[0].evaluation.value;
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
