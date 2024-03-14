$("#forwardBtn").on("click", async () => {
  setTimeout(() => {
    const fen = game.fen();
    const stockfish = new Stockfish();
    removeAllPaintedSquares();
    DisplayBestPositions(fen, stockfish);
    DisplayMoveEvaluation();
  }, 0);
});

$("#backwardBtn").on("click", async () => {
  setTimeout(() => {
    const fen = game.fen();
    const stockfish = new Stockfish();
    removeAllPaintedSquares();
    DisplayBestPositions(fen, stockfish);
    DisplayMoveEvaluation();
  }, 0);
});
async function removeAllPaintedSquares() {
  const allSquares = document.querySelectorAll("[data-square]");
  allSquares.forEach((square) => {
    square.style.backgroundColor = "";
  });
}

async function DisplayMoveEvaluation() {
  const moveEvaluationDiv = document.getElementById("moveEvaluation");
  moveEvaluationDiv.innerHTML = "";
  const moveEvaluationMessages = document.createElement("p");
  moveEvaluationMessages.textContent = "Calculating your move...";
  moveEvaluationDiv.appendChild(moveEvaluationMessages);
  return;
}

let evalArr = [0];
