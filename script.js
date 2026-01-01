const board = document.getElementById("board");
const turnText = document.getElementById("turn");

let currentTurn = "white";
let selectedSquare = null;

turnText.textContent = "Turn: White";

const pieces = [
  "♜","♞","♝","♛","♚","♝","♞","♜",
  "♟","♟","♟","♟","♟","♟","♟","♟",
  "","","","","","","","",
  "","","","","","","","",
  "","","","","","","","",
  "","","","","","","","",
  "♙","♙","♙","♙","♙","♙","♙","♙",
  "♖","♘","♗","♕","♔","♗","♘","♖"
];

// ---------- Helpers ----------
function isWhitePiece(p) { return "♙♖♘♗♕♔".includes(p); }
function isBlackPiece(p) { return "♟♜♞♝♛♚".includes(p); }

function indexOfSquare(square) {
  return [...board.children].indexOf(square);
}

function rowCol(i) {
  return [Math.floor(i / 8), i % 8];
}

function isPathClear(from, to) {
  const [fr, fc] = rowCol(indexOfSquare(from));
  const [tr, tc] = rowCol(indexOfSquare(to));
  const dr = Math.sign(tr - fr);
  const dc = Math.sign(tc - fc);

  let r = fr + dr;
  let c = fc + dc;

  while (r !== tr || c !== tc) {
    if (board.children[r * 8 + c].textContent !== "") return false;
    r += dr;
    c += dc;
  }
  return true;
}

// ---------- MOVE RULES ----------
function isValidMove(from, to) {
  const piece = from.textContent;
  const [fr, fc] = rowCol(indexOfSquare(from));
  const [tr, tc] = rowCol(indexOfSquare(to));
  const dr = tr - fr;
  const dc = tc - fc;

  // Pawn
  if (piece === "♙" || piece === "♟") {
    const dir = piece === "♙" ? -1 : 1;
    const startRow = piece === "♙" ? 6 : 1;

    if (fc === tc && dr === dir && to.textContent === "") return true;

    if (
      fc === tc &&
      fr === startRow &&
      dr === dir * 2 &&
      to.textContent === "" &&
      board.children[(fr + dir) * 8 + fc].textContent === ""
    ) return true;

    if (Math.abs(dc) === 1 && dr === dir && to.textContent !== "") return true;

    return false;
  }

  if (piece === "♖" || piece === "♜")
    return (fr === tr || fc === tc) && isPathClear(from, to);

  if (piece === "♗" || piece === "♝")
    return Math.abs(dr) === Math.abs(dc) && isPathClear(from, to);

  if (piece === "♕" || piece === "♛")
    return (
      fr === tr || fc === tc || Math.abs(dr) === Math.abs(dc)
    ) && isPathClear(from, to);

  if (piece === "♘" || piece === "♞")
    return (
      (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
      (Math.abs(dr) === 1 && Math.abs(dc) === 2)
    );

  if (piece === "♔" || piece === "♚")
    return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

  return false;
}

// ---------- CHECK DETECTION ----------
function isKingInCheck(color) {
  const king = color === "white" ? "♔" : "♚";
  const squares = [...board.children];

  const kingSquare = squares.find(sq => sq.textContent === king);
  if (!kingSquare) return false;

  return squares.some(sq => {
    if (sq.textContent === "") return false;

    if (
      color === "white" && isBlackPiece(sq.textContent) ||
      color === "black" && isWhitePiece(sq.textContent)
    ) {
      return isValidMove(sq, kingSquare);
    }
    return false;
  });
}

// ---------- CREATE BOARD ----------
pieces.forEach((piece, i) => {
  const sq = document.createElement("div");
  sq.classList.add("square");
  sq.classList.add((Math.floor(i / 8) + i) % 2 === 0 ? "white" : "black");
  sq.textContent = piece;
  board.appendChild(sq);
});

// ---------- GAME LOGIC ----------
document.querySelectorAll(".square").forEach(square => {
  square.addEventListener("click", () => {

    if (!selectedSquare) {
      if (square.textContent === "") return;

      if (
        (currentTurn === "white" && isWhitePiece(square.textContent)) ||
        (currentTurn === "black" && isBlackPiece(square.textContent))
      ) {
        selectedSquare = square;
        square.classList.add("selected");
      }
      return;
    }

    if (!isValidMove(selectedSquare, square)) {
      selectedSquare.classList.remove("selected");
      selectedSquare = null;
      return;
    }

    // TEMP MOVE
    const fromPiece = selectedSquare.textContent;
    const toPiece = square.textContent;

    square.textContent = fromPiece;
    selectedSquare.textContent = "";

    // CHECK SAFETY
    if (isKingInCheck(currentTurn)) {
      // undo move
      selectedSquare.textContent = fromPiece;
      square.textContent = toPiece;

      selectedSquare.classList.remove("selected");
      selectedSquare = null;
      return;
    }

    selectedSquare.classList.remove("selected");
    selectedSquare = null;

    // CHECK ALERT
    const opponent = currentTurn === "white" ? "black" : "white";
    if (isKingInCheck(opponent)) {
      alert("CHECK!");
    }

    currentTurn = opponent;
    turnText.textContent = "Turn: " + (currentTurn === "white" ? "White" : "Black");
  });
});
