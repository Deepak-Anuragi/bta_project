// AI Engine for Tic-Tac-Toe
// Provides intelligent moves for single-player mode

export class TicTacToeAI {
  /**
   * Get the best move for the AI
   * @param {Array} board - Current board state (9 elements, 0=empty, 1=X, 2=O)
   * @param {Number} aiPlayer - AI player number (1 or 2)
   * @returns {Number} Position (0-8) for the best move
   */
  static getBestMove(board, aiPlayer) {
    const opponent = aiPlayer === 1 ? 2 : 1;

    // 1. Try to win
    const winMove = this.findWinningMove(board, aiPlayer);
    if (winMove !== -1) return winMove;

    // 2. Block opponent from winning
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove !== -1) return blockMove;

    // 3. Take center if available
    if (board[4] === 0) return 4;

    // 4. Take corners strategically
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(pos => board[pos] === 0);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(pos => board[pos] === 0);
    if (availableEdges.length > 0) {
      return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }

    // 6. Take any available space
    return board.findIndex(cell => cell === 0);
  }

  /**
   * Find a winning move for the given player
   * @param {Array} board - Current board state
   * @param {Number} player - Player number (1 or 2)
   * @returns {Number} Winning position or -1 if none
   */
  static findWinningMove(board, player) {
    // Check all empty positions
    for (let i = 0; i < 9; i++) {
      if (board[i] === 0) {
        // Simulate move
        const testBoard = [...board];
        testBoard[i] = player;
        
        // Check if this move wins
        if (this.checkWinner(testBoard) === player) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Check if there's a winner
   * @param {Array} board - Current board state
   * @returns {Number} Winning player (1 or 2) or 0 if no winner
   */
  static checkWinner(board) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }
    return 0;
  }

  /**
   * Check if board is full
   * @param {Array} board - Current board state
   * @returns {Boolean}
   */
  static isBoardFull(board) {
    return board.every(cell => cell !== 0);
  }

  /**
   * Get game status
   * @param {Array} board - Current board state
   * @returns {Object} { status: 'active'|'won'|'draw', winner: 1|2|0 }
   */
  static getGameStatus(board) {
    const winner = this.checkWinner(board);
    if (winner !== 0) {
      return { status: 'won', winner };
    }
    if (this.isBoardFull(board)) {
      return { status: 'draw', winner: 0 };
    }
    return { status: 'active', winner: 0 };
  }

  /**
   * Calculate AI difficulty (easy, medium, hard)
   * Easy: Random moves
   * Medium: 50% strategy, 50% random
   * Hard: Always optimal moves
   */
  static getBestMoveWithDifficulty(board, aiPlayer, difficulty = 'hard') {
    if (difficulty === 'easy') {
      // Random move
      const available = board
        .map((cell, idx) => cell === 0 ? idx : null)
        .filter(idx => idx !== null);
      return available[Math.floor(Math.random() * available.length)];
    } else if (difficulty === 'medium') {
      // 50% chance of smart move
      if (Math.random() < 0.5) {
        return this.getBestMove(board, aiPlayer);
      } else {
        const available = board
          .map((cell, idx) => cell === 0 ? idx : null)
          .filter(idx => idx !== null);
        return available[Math.floor(Math.random() * available.length)];
      }
    } else {
      // Hard: always optimal
      return this.getBestMove(board, aiPlayer);
    }
  }
}
