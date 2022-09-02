'use strict';

class Maxaminion {
  constructor() {
    this._depth = 5;
    this._algo = this.aiLogic1;

    this._depth2 = 10;
    this._algo2 = this.aiLogic1;

    this.startDeltas = [
      [
        [3, -3],
        [2, -2],
        [1, -1],
        [0, 0],
      ],
      [
        [0, -3],
        [0, -2],
        [0, -1],
        [0, 0],
      ],
      [
        [-3, -3],
        [-2, -2],
        [-1, -1],
        [0, 0],
      ],
      [
        [-3, 0],
        [-2, 0],
        [-1, 0],
        [0, 0],
      ],
    ];
  }

  getMove() {
    const maximizing = GAME.player === 1 ? true : false;
    const depth = GAME.player === 1 ? this._depth2 : this._depth;
    const algo =
      GAME.player === 1 ? this._algo2.bind(this) : this._algo.bind(this);

    return this.minimax(maximizing, depth, -Infinity, Infinity, algo)[1];
  }

  minimax(maximizing, depth, alpha, beta, algo, y = null, x = null) {
    let winnerEval = this.checkForWinner(!maximizing, y, x);
    let openColumns = this.getOpenColumns();
    if (winnerEval || openColumns.length === 0) {
      winnerEval = !winnerEval ? 0 : winnerEval;
      return [winnerEval, '', depth];
    }
    if (depth === 0) return [algo(), '', depth];

    let bestDepth = depth;
    openColumns = shuffle(openColumns);
    let [bestMove, best] = this.getBestMove(openColumns, depth, maximizing);

    if (maximizing) {
      let bestValue = -Infinity;
      for (let col of openColumns) {
        const idxRow = this.placePieceInBoard(col, 1);
        const [evalValue, , newDepth] = this.minimax(
          false,
          depth - 1,
          alpha,
          beta,
          algo,
          idxRow,
          col
        );
        GAME.board[idxRow][col] = 0;
        GAME.openRowInCol.set(col, GAME.openRowInCol.get(col) + 1);
        if (evalValue > bestValue) {
          bestValue = evalValue;
          bestMove = col;
          bestDepth = newDepth;
        } 
        else if (
          (evalValue !== -Infinity || (evalValue === -Infinity && !best)) &&
          evalValue === bestValue &&
          newDepth < bestDepth
        ) {
          bestMove = col;
          bestDepth = newDepth;
        }
        alpha = Math.max(alpha, bestValue);
        if (alpha >= beta) break;
      }
      return [bestValue, bestMove, bestDepth];
    }
    let bestValue = Infinity;
    for (let col of openColumns) {
      const idxRow = this.placePieceInBoard(col, 2);
      const [evalValue, , newDepth] = this.minimax(
        true,
        depth - 1,
        alpha,
        beta,
        algo,
        idxRow,
        col
      );
      GAME.board[idxRow][col] = 0;
      GAME.openRowInCol.set(col, GAME.openRowInCol.get(col) + 1);
      if (evalValue < bestValue) {
        bestValue = evalValue;
        bestMove = col;
        bestDepth = newDepth;
      } else if (
        (evalValue !== Infinity || (evalValue === Infinity && !best)) &&
        evalValue === bestValue &&
        newDepth < bestDepth
      ) {
        bestMove = col;
        bestDepth = newDepth;
      }
      beta = Math.min(beta, bestValue);
      if (beta <= alpha) break;
    }
    return [bestValue, bestMove, bestDepth];
  }

  checkForWinner(maximizing, y, x) {
    if (x === null || y === null) return false;
    const player = maximizing ? 1 : 2;
    let winnerEval = false;

    this.startDeltas.forEach((group, i) => {
      group.forEach(([dy, dx]) => {
        let a = y + dy,
          b = x + dx;
        if (GAME.board[a] && GAME.board[a][b] === player) {
          if (
            GAME.deltas[i].every(([dy1, dx1]) => {
              if (
                GAME.board[a + dy1] &&
                GAME.board[a + dy1][b + dx1] === player
              ) {
                return true;
              } else return false;
            })
          )
            winnerEval = player === 1 ? Infinity : -Infinity;
        }
      });
    });
    return winnerEval;
  }

  getOpenColumns() {
    return GAME.board[0].reduce((acc, el, i) => {
      if (el === 0) acc.push(i);
      return acc;
    }, []);
  }

  placePieceInBoard(col, player) {
    const openRow = GAME.openRowInCol.get(col);
    GAME.openRowInCol.set(col, openRow - 1);
    GAME.board[openRow][col] = player;
    return openRow;
  }

  getBestMove(openCols, depth, maximizing) {
    const notpedestal = [];
    if (
      (maximizing && depth === this._depth2) ||
      (!maximizing && depth === this._depth)
    ) {
      for (let col of openCols) {
        const openRow = GAME.openRowInCol.get(col);
        if (this.checkForBlock(openRow, col)) {
          return [col, true];
        }
        if (!this.checkForpedestal(openRow - 1, col, maximizing)) {
          notpedestal.push(col);
        }
      }
    }
    if (notpedestal.length > 0) return [notpedestal[0], true];
    return [openCols[0], false];
  }

  checkForpedestal(openRow, col, maximizing) {
    if (openRow < 0) return false;
    GAME.board[openRow][col] = maximizing ? 2 : 1;
    const winner = this.checkForWinner(!maximizing, openRow, col);
    GAME.board[openRow][col] = 0;
    return winner ? true : false;
  }

  checkForBlock(y, x) {
    GAME.board[y][x] = GAME.player;
    let block = false;

    this.startDeltas.forEach((group, i) => {
      group.forEach(([dy, dx]) => {
        let a = y + dy,
          b = x + dx;
        if (GAME.board[a] && GAME.board[a][b]) {
          let selfCount = 0;
          let fail = false;
          if (GAME.board[a][b] === GAME.player) selfCount++;
          GAME.deltas[i].forEach(([dy1, dx1]) => {
            let m = a + dy1,
              n = b + dx1;
            if (!GAME.board[m] || !GAME.board[m][n]) fail = true;
            else if (GAME.board[m][n] === GAME.player) selfCount++;
          });
          if (!fail && selfCount === 1) {
            block = true;
          }
        }
      });
    });
    GAME.board[y][x] = 0;
    return block;
  }

  
  set switchEvalAlgo(choice) {
    switch (choice) {
      case 1: {
        this._algo = this.randomEval;
        break;
      }
      case 2: {
        this._algo = this.aiLogic1;
        break;
      }
      default: {
        console.error('bad switchEvalAlgo flag');
      }
    }
  }

  resetDepths() {
    this._depth = 5;
    this._depth2 = 5;
  }

  set depth(choice) {
    this._depth = choice;
  }

  set switchEvalAlgo2(choice) {
    switch (choice) {
      case 1: {
        this._algo2 = this.randomEval;
        break;
      }
      case 2: {
        this._algo2 = this.aiLogic1;
        break;
      }
      default: {
        console.error('bad switchEvalAlgo flag');
      }
    }
  }

  set depth2(choice) {
    this._depth2 = choice;
  }

  randomEval() {
    const maybeNegative = Math.floor(Math.random() * 2) === 0 ? -1 : 1;
    return Math.floor(Math.random() * 10) * maybeNegative;
  }
  aiLogic1() {
    let boardScore = 0;

    GAME.board.forEach((row, i) => {
      row.forEach((el, j) => {
        boardScore += this.horizCheck(el, i, j);
        boardScore += this.vertiCheck(el, i, j);
        boardScore += this.upRightCheck(el, i, j);
        boardScore += this.downRightCheck(el, i, j);
      });
    });
    return boardScore;
  }

  horizCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        if (
          abs(count) === 2 ||
          (emptyStreak === -1 && end_space_streak === 1)
        ) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  vertiCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0;
    if (row <= GAME._rows - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row + i][col];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
          }
          return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  upRightCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (row > 2 && col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row - i][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  downRightCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (row <= GAME._rows - 4 && col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row + i][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }
}

function shuffle(arr) {
  for (let i in arr) {
    const rando = Math.floor(Math.random() * arr.length);
    [arr[rando], arr[i]] = [arr[i], arr[rando]];
  }
  return arr;
}
function abs(val) {
  return val > 0 ? val : val * -1;
}
