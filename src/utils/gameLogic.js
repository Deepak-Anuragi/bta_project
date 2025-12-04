/**
 * Game Logic Utilities
 * Handles turn management, move validation, and game state
 */

// Game status constants
export const GAME_STATUS = {
  WAITING: 0,
  IN_PROGRESS: 1,
  FINISHED: 2,
  CANCELLED: 3
};

// Player constants
export const PLAYER = {
  NONE: 0,
  PLAYER_X: 1,
  PLAYER_O: 2
};

/**
 * Determines if it's the current player's turn
 * @param {number} currentTurn - Current turn value (1 for X, 2 for O)
 * @param {string} playerAddress - Current player's address
 * @param {string} playerXAddress - Address of Player X
 * @param {string} playerOAddress - Address of Player O
 * @returns {boolean} True if it's the current player's turn
 */
export const isPlayerTurn = (currentTurn, playerAddress, playerXAddress, playerOAddress) => {
  if (!playerAddress || !playerXAddress || !playerOAddress) {
    return false;
  }

  const normalizedPlayer = playerAddress.toLowerCase();
  const normalizedX = playerXAddress.toLowerCase();
  const normalizedO = playerOAddress.toLowerCase();

  // If it's X's turn and player is X
  if (currentTurn === PLAYER.PLAYER_X) {
    return normalizedPlayer === normalizedX;
  }

  // If it's O's turn and player is O
  if (currentTurn === PLAYER.PLAYER_O) {
    return normalizedPlayer === normalizedO;
  }

  return false;
};

/**
 * Determines if a move is valid
 * @param {number[]} board - Current board state (9 cells)
 * @param {number} position - Position to place move (0-8)
 * @param {number} currentTurn - Current turn (1 for X, 2 for O)
 * @param {string} playerAddress - Current player's address
 * @param {string} playerXAddress - Address of Player X
 * @param {string} playerOAddress - Address of Player O
 * @param {number} gameStatus - Current game status
 * @returns {object} { valid: boolean, reason: string }
 */
export const validateMove = (
  board,
  position,
  currentTurn,
  playerAddress,
  playerXAddress,
  playerOAddress,
  gameStatus
) => {
  // Check game status
  if (gameStatus !== GAME_STATUS.IN_PROGRESS) {
    return { valid: false, reason: 'Game is not in progress' };
  }

  // Check position validity
  if (position < 0 || position > 8) {
    return { valid: false, reason: 'Position out of bounds' };
  }

  // Check if position is empty
  if (board[position] !== 0) {
    return { valid: false, reason: 'Position already occupied' };
  }

  // Check if it's the player's turn
  if (!isPlayerTurn(currentTurn, playerAddress, playerXAddress, playerOAddress)) {
    return { valid: false, reason: 'Not your turn' };
  }

  return { valid: true, reason: '' };
};

/**
 * Gets the current turn message
 * @param {number} gameStatus - Current game status
 * @param {number} currentTurn - Current turn (1 for X, 2 for O)
 * @param {string} playerAddress - Current player's address
 * @param {string} playerXAddress - Address of Player X
 * @param {string} playerOAddress - Address of Player O
 * @param {number} winner - Winner value (0=none, 1=X, 2=O)
 * @returns {string} Status message
 */
export const getTurnMessage = (
  gameStatus,
  currentTurn,
  playerAddress,
  playerXAddress,
  playerOAddress,
  winner = 0
) => {
  // Game finished states
  if (gameStatus === GAME_STATUS.FINISHED) {
    if (winner === 0) {
      return 'Game ended in a draw';
    }
    if (winner === PLAYER.PLAYER_X) {
      return 'Player X won! 🎉';
    }
    if (winner === PLAYER.PLAYER_O) {
      return 'Player O won! 🎉';
    }
  }

  if (gameStatus === GAME_STATUS.CANCELLED) {
    return 'Game cancelled';
  }

  if (gameStatus === GAME_STATUS.WAITING) {
    return 'Waiting for opponent...';
  }

  // Check if player address is valid
  if (!playerAddress || !playerXAddress || !playerOAddress) {
    return 'Loading...';
  }

  // Determine whose turn it is
  const isYourTurn = isPlayerTurn(
    currentTurn,
    playerAddress,
    playerXAddress,
    playerOAddress
  );

  if (isYourTurn) {
    return '🎯 Your turn!';
  } else {
    const opponentSymbol = currentTurn === PLAYER.PLAYER_X ? '❌' : '⭕';
    return `⏳ ${opponentSymbol} Opponent's turn...`;
  }
};

/**
 * Gets the player's symbol
 * @param {string} playerAddress - Player's address
 * @param {string} playerXAddress - Address of Player X
 * @returns {string} 'X' or 'O'
 */
export const getPlayerSymbol = (playerAddress, playerXAddress) => {
  if (!playerAddress || !playerXAddress) return '';
  return playerAddress.toLowerCase() === playerXAddress.toLowerCase() ? 'X' : 'O';
};

/**
 * Gets the opponent's address
 * @param {string} playerAddress - Current player's address
 * @param {string} playerXAddress - Address of Player X
 * @param {string} playerOAddress - Address of Player O
 * @returns {string} Opponent's address
 */
export const getOpponentAddress = (playerAddress, playerXAddress, playerOAddress) => {
  if (!playerAddress || !playerXAddress || !playerOAddress) return '';
  const normalized = playerAddress.toLowerCase();
  return normalized === playerXAddress.toLowerCase() ? playerOAddress : playerXAddress;
};

/**
 * Formats an Ethereum address
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address (0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
