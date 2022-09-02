'use strict';

function animateDrop(col, places) {
  const topPieceViewport = GAME.DOMColumns[col].lastElementChild;

  document.documentElement.style.setProperty('--drop-places-count', places + 1);
  topPieceViewport.classList.add('drop-piece');
  topPieceViewport.firstElementChild.classList.add('fall-flip');
  if (GAME.player === 1) {
    topPieceViewport.firstElementChild.firstElementChild.lastElementChild.classList.add(
      'hidden'
    );
    topPieceViewport.firstElementChild.firstElementChild.firstElementChild.classList.remove(
      'backface-hidden'
    );
  } else {
    topPieceViewport.firstElementChild.firstElementChild.firstElementChild.classList.add(
      'hidden'
    );
    topPieceViewport.firstElementChild.firstElementChild.lastElementChild.classList.remove(
      'backface-hidden'
    );
  }

  const newPiece = GAME.pieceFactory(col);

  setTimeout(() => {
    if (!topPieceViewport.parentElement) return;
    topPieceViewport.style.top = `calc(${places + 1} * var(--piece-size))`;
    topPieceViewport.classList.remove('drop-piece');
    topPieceViewport.firstElementChild.classList.remove('fall-flip');
    topPieceViewport.firstElementChild.firstElementChild.lastElementChild.classList.remove(
      'hidden'
    );
    topPieceViewport.firstElementChild.firstElementChild.firstElementChild.classList.remove(
      'hidden'
    );
    topPieceViewport.firstElementChild.firstElementChild.lastElementChild.classList.add(
      'backface-hidden'
    );
    topPieceViewport.firstElementChild.firstElementChild.firstElementChild.classList.add(
      'backface-hidden'
    );
    ('');
    topPieceViewport.parentElement.innerHTML += newPiece;
    if (places > 0) fadePieceIn(col);
  }, GAME._dropDelay + 10);
}

function fadePieceIn(col) {
  setTimeout(() => {
    GAME.DOMColumns[col].lastElementChild.style.opacity = '1';
  }, 50);
}

function animateFlipAllTops() {
  let colList = [...GAME.DOMColumns];
  colList.pop();
  const player = GAME.player;
  if (player === 2) colList = colList.reverse();

  return setTimeout(() => {
    colList.forEach((col, i) => {
      setTimeout(() => {
        if (boardIsEmpty()) return;
        col.lastElementChild.firstElementChild.firstElementChild.classList.toggle(
          'flipped'
        );

        if (
          i === GAME._cols - 1 &&
          (GAME._aiPlayers == 0 || (GAME._aiPlayers == 1 && player === 2))
        ) {
          setTimeout(() => {
            GAME.blockColClick = false;
          }, 500);
        }
      }, GAME._dropDelay * 0.03 * i);
    });
  }, GAME._dropDelay + 0.4 * GAME._dropDelay);
}

function animateWinningPieces(winner) {
  if (!winner) return;
  setTimeout(() => {
    winner.forEach(([row, col]) => {
      const pieceWrapper =
        GAME.DOMColumns[col].children[GAME._rows - 1 - row].firstElementChild;
      pieceWrapper.classList.add('winner');
    });
  }, GAME._dropDelay + GAME._dropDelay * 0.2);
}

function animateArrows() {
  return setTimeout(() => {
    document.querySelector('.arrow-left').classList.add('shoot-arrow-left');
    document.querySelector('.arrow-right').classList.add('shoot-arrow-right');
    setTimeout(() => {
      document
        .querySelector('.arrow-left')
        .classList.remove('shoot-arrow-left');
      document
        .querySelector('.arrow-right')
        .classList.remove('shoot-arrow-right');
    }, 6000);
  }, 4250);
}

function animateGameOver() {
  return setTimeout(() => {
    const gameOverDiv = document.querySelector('.game-over');
    gameOverDiv.parentElement.classList.remove('hidden');
    gameOverDiv.classList.add('animate-g-over');
  }, 4700);
}

function fillInWinnerDOM(winBool) {
  const winnerDiv = document.getElementById('winner');
  let html = '',
    colorClass;
  if (winBool) {
    colorClass = GAME.player === 1 ? 'yellow' : 'red';
    html = `<div>${[...colorClass]
      .map((e, i) => (i === 0 ? e.toUpperCase() : e))
      .join('')} Player Wins!!!</div>`;
  } else {
    html = "IT'S A TIE!";
    colorClass = 'green';
  }
  winnerDiv.innerHTML = html;
  winnerDiv.classList.remove('yellow', 'red', 'green');
  winnerDiv.classList.add(colorClass);
}

function boardIsEmpty() {
  return GAME.board[GAME._rows - 1].every(el => !el);
}
