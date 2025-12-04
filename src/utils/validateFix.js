/**
 * Quick Test Validation
 * Validates the critical fix with simple assertions
 */

import {
  isPlayerTurn,
  validateMove,
  getTurnMessage,
  GAME_STATUS,
  PLAYER
} from './gameLogic';

const PLAYER_X = '0x1234567890123456789012345678901234567890';
const PLAYER_O = '0x0987654321098765432109876543210987654321';

export const validateTurnLogicFix = () => {
  console.log('\n🔍 Validating Turn Logic Fix...\n');

  // Critical Test 1: Player X should see "Your turn" when it's their turn
  const xHasTurn = isPlayerTurn(PLAYER.PLAYER_X, PLAYER_X, PLAYER_X, PLAYER_O);
  const xTurnMsg = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_X,
    PLAYER_X,
    PLAYER_X,
    PLAYER_O,
    PLAYER.NONE
  );
  console.log(`✓ Player X turn: ${xHasTurn}`);
  console.log(`✓ Player X message: "${xTurnMsg}"`);
  if (!xTurnMsg.includes('Your turn')) {
    throw new Error('FAILED: Player X should see "Your turn"');
  }

  // Critical Test 2: Player X should see "Opponent's turn" when it's O's turn
  const oHasTurnFromX = isPlayerTurn(PLAYER.PLAYER_O, PLAYER_X, PLAYER_X, PLAYER_O);
  const xWaitMsg = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_O,
    PLAYER_X,
    PLAYER_X,
    PLAYER_O,
    PLAYER.NONE
  );
  console.log(`✓ Player X waiting: ${!oHasTurnFromX}`);
  console.log(`✓ Player X wait message: "${xWaitMsg}"`);
  if (!xWaitMsg.includes('Opponent')) {
    throw new Error('FAILED: Player X should see "Opponent\'s turn"');
  }

  // Critical Test 3: Player O should see "Your turn" when it's their turn
  const oHasTurn = isPlayerTurn(PLAYER.PLAYER_O, PLAYER_O, PLAYER_X, PLAYER_O);
  const oTurnMsg = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_O,
    PLAYER_O,
    PLAYER_X,
    PLAYER_O,
    PLAYER.NONE
  );
  console.log(`✓ Player O turn: ${oHasTurn}`);
  console.log(`✓ Player O message: "${oTurnMsg}"`);
  if (!oTurnMsg.includes('Your turn')) {
    throw new Error('FAILED: Player O should see "Your turn"');
  }

  // Critical Test 4: Player O should see "Opponent's turn" when it's X's turn
  const xHasTurnFromO = isPlayerTurn(PLAYER.PLAYER_X, PLAYER_O, PLAYER_X, PLAYER_O);
  const oWaitMsg = getTurnMessage(
    GAME_STATUS.IN_PROGRESS,
    PLAYER.PLAYER_X,
    PLAYER_O,
    PLAYER_X,
    PLAYER_O,
    PLAYER.NONE
  );
  console.log(`✓ Player O waiting: ${!xHasTurnFromO}`);
  console.log(`✓ Player O wait message: "${oWaitMsg}"`);
  if (!oWaitMsg.includes('Opponent')) {
    throw new Error('FAILED: Player O should see "Opponent\'s turn"');
  }

  // Critical Test 5: Move validation should work correctly
  const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const xMoveValidation = validateMove(
    board,
    0,
    PLAYER.PLAYER_X,
    PLAYER_X,
    PLAYER_X,
    PLAYER_O,
    GAME_STATUS.IN_PROGRESS
  );
  console.log(`✓ X can move when it's X's turn: ${xMoveValidation.valid}`);
  if (!xMoveValidation.valid) {
    throw new Error('FAILED: X should be able to move on their turn');
  }

  const oMoveValidation = validateMove(
    board,
    0,
    PLAYER.PLAYER_X,
    PLAYER_O,
    PLAYER_X,
    PLAYER_O,
    GAME_STATUS.IN_PROGRESS
  );
  console.log(`✓ O cannot move when it's X's turn: ${!oMoveValidation.valid}`);
  if (oMoveValidation.valid) {
    throw new Error('FAILED: O should NOT be able to move on X\'s turn');
  }

  console.log('\n✅ ALL CRITICAL TESTS PASSED!\n');
  console.log('The turn logic fix is correct and robust.\n');
  return true;
};

// Run if executed directly
if (typeof module !== 'undefined' && require.main === module) {
  try {
    validateTurnLogicFix();
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:\n', error.message);
    process.exit(1);
  }
}
