#!/usr/bin/env node

/**
 * Game Logic Test Script
 * Run this to verify all game logic tests pass
 */

const {
  testIsPlayerTurn,
  testValidateMove,
  testGetTurnMessage,
  testGetPlayerSymbol,
  testGetOpponentAddress,
  testFormatAddress,
  runAllTests
} = require('./src/utils/gameLogic.test');

console.log('\n🎮 Blockchain Tic-Tac-Toe - Game Logic Test Suite\n');
console.log('═'.repeat(60));

const success = runAllTests();

console.log('═'.repeat(60));

if (success) {
  console.log('\n✅ All tests passed! The game logic is robust and correct.\n');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
