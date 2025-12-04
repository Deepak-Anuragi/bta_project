/**
 * Game Logic Unit Tests
 * Tests for turn management and move validation
 */

import {
  isPlayerTurn,
  validateMove,
  getTurnMessage,
  getPlayerSymbol,
  getOpponentAddress,
  formatAddress,
  GAME_STATUS,
  PLAYER
} from './gameLogic';

// Test utilities
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`❌ FAILED: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(
      `❌ FAILED: ${message}\nExpected: ${expected}\nActual: ${actual}`
    );
  }
  console.log(`✅ PASSED: ${message}`);
};

// Test fixtures
const PLAYER_X_ADDR = '0x1234567890123456789012345678901234567890';
const PLAYER_O_ADDR = '0x0987654321098765432109876543210987654321';
const UNKNOWN_ADDR = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

// ============ isPlayerTurn Tests ============
export const testIsPlayerTurn = () => {
  console.log('\n📋 Testing isPlayerTurn...');

  // Test 1: Player X's turn
  assert(
    isPlayerTurn(PLAYER.PLAYER_X, PLAYER_X_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Player X should have turn when currentTurn=1 and playerAddress is X'
  );

  // Test 2: Player O's turn
  assert(
    isPlayerTurn(PLAYER.PLAYER_O, PLAYER_O_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Player O should have turn when currentTurn=2 and playerAddress is O'
  );

  // Test 3: Player X when it's O's turn
  assert(
    !isPlayerTurn(PLAYER.PLAYER_O, PLAYER_X_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Player X should NOT have turn when currentTurn=2'
  );

  // Test 4: Player O when it's X's turn
  assert(
    !isPlayerTurn(PLAYER.PLAYER_X, PLAYER_O_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Player O should NOT have turn when currentTurn=1'
  );

  // Test 5: Unknown player
  assert(
    !isPlayerTurn(PLAYER.PLAYER_X, UNKNOWN_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Unknown player should not have turn'
  );

  // Test 6: Case insensitivity
  assert(
    isPlayerTurn(
      PLAYER.PLAYER_X,
      PLAYER_X_ADDR.toUpperCase(),
      PLAYER_X_ADDR.toLowerCase(),
      PLAYER_O_ADDR
    ),
    'Turn check should be case-insensitive'
  );

  // Test 7: Null player address
  assert(
    !isPlayerTurn(PLAYER.PLAYER_X, null, PLAYER_X_ADDR, PLAYER_O_ADDR),
    'Should return false for null player address'
  );

  // Test 8: Null addresses
  assert(
    !isPlayerTurn(PLAYER.PLAYER_X, PLAYER_X_ADDR, null, null),
    'Should return false for null X or O addresses'
  );

  console.log('✅ All isPlayerTurn tests passed!\n');
};

// ============ validateMove Tests ============
export const testValidateMove = () => {
  console.log('\n📋 Testing validateMove...');

  const emptyBoard = Array(9).fill(0);
  const partialBoard = [1, 0, 2, 0, 1, 0, 0, 0, 0];
  const fullBoard = [1, 2, 1, 2, 1, 2, 1, 2, 1];

  // Test 1: Valid move - empty position
  const result1 = validateMove(
    emptyBoard,
    0,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(result1.valid, 'Should allow move on empty position');

  // Test 2: Invalid move - occupied position
  const result2 = validateMove(
    partialBoard,
    0,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(!result2.valid, 'Should reject move on occupied position');
  assertEqual(result2.reason, 'Position already occupied', 'Correct error reason');

  // Test 3: Invalid move - wrong player's turn
  const result3 = validateMove(
    emptyBoard,
    0,
    PLAYER.PLAYER_X,
    PLAYER_O_ADDR, // O trying to move on X's turn
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(!result3.valid, 'Should reject move when not player\'s turn');
  assertEqual(result3.reason, 'Not your turn', 'Correct error reason');

  // Test 4: Invalid move - out of bounds
  const result4 = validateMove(
    emptyBoard,
    9,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(!result4.valid, 'Should reject position out of bounds');

  // Test 5: Invalid move - game not in progress
  const result5 = validateMove(
    emptyBoard,
    0,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.FINISHED
  );
  assert(!result5.valid, 'Should reject move when game is finished');
  assertEqual(result5.reason, 'Game is not in progress', 'Correct error reason');

  // Test 6: Invalid move - game waiting
  const result6 = validateMove(
    emptyBoard,
    0,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.WAITING
  );
  assert(!result6.valid, 'Should reject move when game is waiting');

  // Test 7: Invalid move - negative position
  const result7 = validateMove(
    emptyBoard,
    -1,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(!result7.valid, 'Should reject negative position');

  // Test 8: Valid move for Player O
  const result8 = validateMove(
    emptyBoard,
    5,
    PLAYER.PLAYER_O,
    PLAYER_O_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    GAME_STATUS.IN_PROGRESS
  );
  assert(result8.valid, 'Should allow valid move for Player O');

  console.log('✅ All validateMove tests passed!\n');
};

// ============ getTurnMessage Tests ============
export const testGetTurnMessage = () => {
  console.log('\n📋 Testing getTurnMessage...');

  // Test 1: Your turn (Player X)
  const msg1 = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(
    msg1.includes('Your turn'),
    'Should show "Your turn" for X when it\'s X\'s turn'
  );

  // Test 2: Your turn (Player O)
  const msg2 = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_O,
    PLAYER_O_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(
    msg2.includes('Your turn'),
    'Should show "Your turn" for O when it\'s O\'s turn'
  );

  // Test 3: Opponent's turn (Player X)
  const msg3 = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_O,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(
    msg3.includes('Opponent\'s turn'),
    'Should show "Opponent\'s turn" for X when it\'s O\'s turn'
  );

  // Test 4: Game finished - Draw
  const msg4 = getTurnMessage(
    GAME_STATUS.FINISHED,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(msg4.includes('draw'), 'Should show draw message');

  // Test 5: Game finished - X won
  const msg5 = getTurnMessage(
    GAME_STATUS.FINISHED,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    PLAYER.PLAYER_X
  );
  assert(msg5.includes('X won'), 'Should show X won message');

  // Test 6: Game finished - O won
  const msg6 = getTurnMessage(
    GAME_STATUS.FINISHED,
    PLAYER.PLAYER_O,
    PLAYER_O_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    PLAYER.PLAYER_O
  );
  assert(msg6.includes('O won'), 'Should show O won message');

  // Test 7: Game cancelled
  const msg7 = getTurnMessage(
    GAME_STATUS.CANCELLED,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(msg7.includes('cancelled'), 'Should show cancelled message');

  // Test 8: Game waiting
  const msg8 = getTurnMessage(
    GAME_STATUS.WAITING,
    PLAYER.PLAYER_X,
    PLAYER_X_ADDR,
    PLAYER_X_ADDR,
    PLAYER_O_ADDR,
    0
  );
  assert(msg8.includes('Waiting'), 'Should show waiting message');

  console.log('✅ All getTurnMessage tests passed!\n');
};

// ============ getPlayerSymbol Tests ============
export const testGetPlayerSymbol = () => {
  console.log('\n📋 Testing getPlayerSymbol...');

  // Test 1: Player X
  assertEqual(
    getPlayerSymbol(PLAYER_X_ADDR, PLAYER_X_ADDR),
    'X',
    'Should return X for Player X'
  );

  // Test 2: Player O
  assertEqual(
    getPlayerSymbol(PLAYER_O_ADDR, PLAYER_X_ADDR),
    'O',
    'Should return O for Player O'
  );

  // Test 3: Case insensitivity
  assertEqual(
    getPlayerSymbol(PLAYER_X_ADDR.toUpperCase(), PLAYER_X_ADDR.toLowerCase()),
    'X',
    'Should be case-insensitive'
  );

  // Test 4: Null address
  assertEqual(
    getPlayerSymbol(null, PLAYER_X_ADDR),
    '',
    'Should return empty string for null address'
  );

  console.log('✅ All getPlayerSymbol tests passed!\n');
};

// ============ getOpponentAddress Tests ============
export const testGetOpponentAddress = () => {
  console.log('\n📋 Testing getOpponentAddress...');

  // Test 1: Get opponent for X
  assertEqual(
    getOpponentAddress(PLAYER_X_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    PLAYER_O_ADDR,
    'Should return O address when player is X'
  );

  // Test 2: Get opponent for O
  assertEqual(
    getOpponentAddress(PLAYER_O_ADDR, PLAYER_X_ADDR, PLAYER_O_ADDR),
    PLAYER_X_ADDR,
    'Should return X address when player is O'
  );

  // Test 3: Case insensitivity
  assertEqual(
    getOpponentAddress(PLAYER_X_ADDR.toUpperCase(), PLAYER_X_ADDR.toLowerCase(), PLAYER_O_ADDR),
    PLAYER_O_ADDR,
    'Should be case-insensitive'
  );

  console.log('✅ All getOpponentAddress tests passed!\n');
};

// ============ formatAddress Tests ============
export const testFormatAddress = () => {
  console.log('\n📋 Testing formatAddress...');

  // Test 1: Valid address
  const formatted = formatAddress(PLAYER_X_ADDR);
  assert(
    formatted.includes('...') && formatted.length === 13,
    'Should format address correctly (0x1234...7890)'
  );

  // Test 2: Null address
  assertEqual(
    formatAddress(null),
    '',
    'Should return empty string for null'
  );

  // Test 3: Empty address
  assertEqual(
    formatAddress(''),
    '',
    'Should return empty string for empty input'
  );

  console.log('✅ All formatAddress tests passed!\n');
};

// ============ Run All Tests ============
export const runAllTests = () => {
  console.log('\n🧪 Running Game Logic Unit Tests...\n');
  console.log('═'.repeat(50));

  try {
    testIsPlayerTurn();
    testValidateMove();
    testGetTurnMessage();
    testGetPlayerSymbol();
    testGetOpponentAddress();
    testFormatAddress();

    console.log('═'.repeat(50));
    console.log('\n🎉 ALL TESTS PASSED!\n');
    return true;
  } catch (error) {
    console.error('\n' + '═'.repeat(50));
    console.error(`\n${error.message}\n`);
    return false;
  }
};

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && module.hot) {
  runAllTests();
}
