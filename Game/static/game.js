'use strict';

class ConnectFour {
  constructor() {
    this.DOMBoard = document.querySelector('main');
    this.DOMColumns = null;
    this.aiTimeouts = [null, null];
    this.flipAllTimer = null;
    this.gameOverAnimations = [null, null];
    this.aiPlayersChangeTimer = null;
    this.board = null;
    this.openRowInCol = null;
    this.moves = null;
    this.player = 1;
    this.blockColClick = false;
    this._dropDelay = 430;
    this._rows = 6;
    this._cols = 7;
    this._aiPlayers = 1;
    this._currColumn = null;
    this.deltas = [
      [
        [-1, 1],
        [-2, 2],
        [-3, 3],
      ],
      [
        [0, 1],
        [0, 2],
        [0, 3],
      ],
      [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
      [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    ];
    this.DOMBoardInit();
    this.initGame();
    this.setBoardEvtListener();
  }

  DOMBoardInit() {
    this.setCSSVariables();
    this.addDOMColumns();
  }

 initGame() {
    clearTimeout(this.flipAllTimer);
    this.aiTimeouts.forEach(id => clearTimeout(id));
    this.gameOverAnimations.forEach(id => clearTimeout(id));

    this.board = new Array(this._rows)
      .fill(0)
      .map(el => new Array(this._cols).fill(0));
    this.openRowInCol = this.createOpenRowMap();
    this.moves = this._rows * this._cols;
    this.player = 1;

    this.resetBoard();
    if (this._aiPlayers < 2) {
      this.blockColClick = false;
      this.resetPlayRate();
    } else {
      this.aiVsAiFirstMove();
      this.blockColClick = true;
    }
  }

  createOpenRowMap() {
    const mapp = new Map();
    for (let i = 0; i < this._cols; i++) {
      mapp.set(i, this._rows - 1);
    }
    return mapp;
  }

  setBoardEvtListener() {
    this.DOMBoard.addEventListener('click', this.setCurrCol.bind(this));
  }

  setCurrCol(e) {
    if (this.blockColClick) return;

    const col = e.target.dataset['col'];
    if (col) {
      this._currColumn = +col;
      this.placePiece();
    }
  }

  resetPlayRate() {
    this._dropDelay = 430;
    document.querySelector('#drop-delay').value = 650;
    document.documentElement.style.setProperty(
      '--drop-delay',
      `${this._dropDelay}ms`
    );
  }

  aiVsAiFirstMove() {
    this._currColumn = MAXIMINION.getMove();
    this.aiTimeouts[this.player - 1] = setTimeout(
      () => this.placePiece(),
      1000
    );
  }

  placePiece() {
    const places = this.alterBoard();
    if (places === -1) return;

    this.blockColClick = true;
    this.moves--;

    animateDrop(this._currColumn, places);
    this.flipAllTimer = animateFlipAllTops();

    const gameOver = this.checkForWin();
    this.switchPlayer();

    if (!gameOver) {
      if (
        (this._aiPlayers && this.player == 2) ||
        (this._aiPlayers === 2 && this.player === 1)
      )
        this.makeAIMove();
    }
  }

  makeAIMove() {
    this.aiTimeouts[this.player - 1] = setTimeout(() => {
      this._currColumn = MAXIMINION.getMove();
      this.placePiece();
    }, 2 * this._dropDelay);
  }

  alterBoard() {
    const openRow = this.openRowInCol.get(this._currColumn);
    if (openRow >= 0) {
      this.openRowInCol.set(this._currColumn, openRow - 1);
      this.board[openRow][this._currColumn] = this.player;
    }
    return openRow;
  }

  switchPlayer() {
    this.player = this.player === 1 ? 2 : 1;
  }

  checkForWin() {
    let winner = false;
    this.board.forEach((row, i) => {
      row.forEach((el, j) => {
        console.log("this is the deltas " + this.deltas);
        if (el === this.player) {
          for (let delta of this.deltas) {
            if (
              delta.every(([dy, dx]) => {
                if (this.board[i + dy]) {
                  console.log("this is the deltas after " + this.deltas);
                  return this.board[i + dy][j + dx] === el;
                }
                return false;
              })
            )

              winner = [[i, j], ...delta.map(([dy, dx]) => [i + dy, j + dx])];
          }
        }
      });
    });
    if (winner || this.moves == 0) {
      clearTimeout(this.flipAllTimer);
      this.endGame(winner);
      return true;
    }
  }

  endGame(winner) {
    animateWinningPieces(winner);
    this.gameOverAnimations[0] = animateArrows();
    fillInWinnerDOM(winner);
    this.gameOverAnimations[1] = animateGameOver();
  }

  setCSSVariables() {
    let root = document.documentElement;
    root.style.setProperty('--number-rows', this._rows + 1);
    root.style.setProperty('--number-cols', this._cols);
    root.style.setProperty('--drop-delay', `${this._dropDelay}ms`);
  }

  addDOMColumns() {
    this.DOMBoard.innerHTML = '';
    const colWrapper = document.createElement('div');
    colWrapper.classList.add('board');
    this.DOMBoard.append(colWrapper);
    for (let i = 0; i < this._cols; i++) {
      colWrapper.append(this.columnFactory(i));
    }
    this.DOMColumns = colWrapper.children;
    this.addGridBoard(colWrapper);
  }

  addGridBoard(colWrapper) {
    const gridBoard = document.createElement('div');
    gridBoard.classList.add('grid-board');
    for (let row = 0; row < this._rows; row++) {
      gridBoard.append(this.createGridRow());
    }
    colWrapper.append(gridBoard);
  }

  createGridRow() {
    const row = document.createElement('div');
    row.classList.add('grid-row');
    for (let col = 0; col < this._cols; col++) {
      row.append(this.createCuttoutBlock());
    }
    return row;
  }

  createCuttoutBlock() {
    const cuttOutWrapper = document.createElement('div');
    cuttOutWrapper.classList.add('cuttout-wrapper');

    const cuttOUt = document.createElement('div');
    cuttOUt.classList.add('cuttout');

    cuttOutWrapper.append(cuttOUt);
    return cuttOutWrapper;
  }

  resetBoard() {
    this.clearGameOverPlacard();
    this.emptyBoardAddPieces();
  }

  clearGameOverPlacard() {
    const gameOverDiv = document.querySelector('.game-over');
    if (gameOverDiv.classList.contains('animate-g-over')) {
      gameOverDiv.parentElement.classList.add('animate-clear-g-over');
      setTimeout(() => {
        gameOverDiv.parentElement.classList.add('hidden');
        setTimeout(() => {
          gameOverDiv.classList.remove('animate-g-over');
          gameOverDiv.parentElement.classList.remove('animate-clear-g-over');
        }, 2000);
      }, 1010);
    }
  }

  emptyBoardAddPieces() {
    const cols = [...this.DOMBoard.firstElementChild.children].slice(
      0,
      this._cols
    );
    cols.forEach(col => (col.innerHTML = ''));
    cols.forEach((col, i) => {
      col.innerHTML = this.pieceFactory(i);
      fadePieceIn(i);
    });
  }

  pieceFactory(col) {
    const flipped = this.player === 2 ? 'flipped' : '';

    return `<div class="piece-viewport opaque" data-col="${col}">
                    <div class="piece-wrapper flx-std">
                        <div class="piece ${flipped}">
                            <div class="front backface-hidden" data-col="${col}"></div>
                            <div class="back backface-hidden" data-col="${col}"></div>
                        </div>
                    </div>        
                </div>`;
  }

  columnFactory(i) {
    const column = document.createElement('div');
    column.className = 'column';
    column.setAttribute('data-col', i);
    return column;
  }

  set rows(num) {
    this._rows = num;
    this.DOMBoardInit();
    this.initGame();
    this.resetAiDepth();
  }

  set cols(num) {
    this._cols = num;
    this.DOMBoardInit();
    this.initGame();
    this.resetAiDepth();
  }

  set aiPlayers(num) {
    clearTimeout(this.aiPlayersChangeTimers);
    clearTimeout(this.aiTimeouts);
    this._aiPlayers = num;
    this.resetPlayRate();
    this.resetAiDepth();
    this.aiPlayersChangeTimers = setTimeout(() => {
      let temp = this.moves;
      if (this.blockColClick) {
        setTimeout(() => {
          if (temp === this.moves) {
            this.initGame();
          }
        }, 3.4 * this._dropDelay);
        return;
      }
      if (this._aiPlayers === 1 && this.player == 2) this.makeAIMove();
      if (this._aiPlayers === 2) {
        setTimeout(() => {
          if (this.moves === temp) this.makeAIMove();
        }, 2 * this._dropDelay);
      }
    }, 6 * this._dropDelay);
  }

  resetAiDepth() {
    MAXIMINION.resetDepths();
    document.querySelector('#depth').value = 5;
    document.querySelector('#depth2').value = 5;
  }

  set dropDelay(num) {
    this._dropDelay = 1050 - num;
  }

  async setBoard() {
    this.aiPlayers = 0;
    this.initGame();
    this._dropDelay = 50;
    const moveList = [
      3,
      6,
      3,
      6,
      3,
      6,
      2,
      4,
      4,
      4,
      2,
      4,
      2,
      4,
      4,
      0,
      0,
      2,
      0,
      0,
      0,
      3,
      2,
      3,
      3,
      2,
      6,
    ];
    for (let col of moveList) {
      this._currColumn = col;
      this.placePiece();
      await sleep(0.07);
    }
  }
}

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}
