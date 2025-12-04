import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TicTacToeAI } from '../utils/AIEngine';
import './GameBoard.css';

const GameBoard = ({ gameContract, gameId, account, onBack }) => {
  console.log('GameBoard rendered with gameId:', gameId);
  
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(0));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAIGame, setIsAIGame] = useState(false);
  const [isLocalGame, setIsLocalGame] = useState(false);
  const [localCurrentPlayer, setLocalCurrentPlayer] = useState(1); // 1 = Player 1, 2 = Player 2
  const [aiDifficulty, setAiDifficulty] = useState('hard');

  useEffect(() => {
    if (!gameId) {
      console.warn('GameBoard: gameId is null or undefined');
      return;
    }
    
    // Check if this is an AI or local game
    if (gameId.startsWith('ai-')) {
      const savedGame = localStorage.getItem('currentGame');
      if (savedGame) {
        const gameData = JSON.parse(savedGame);
        setIsAIGame(true);
        setAiDifficulty(gameData.difficulty);
        setGame(gameData);
        setBoard(gameData.board);
        setMessage('🤖 Playing vs AI - Your turn!');
      }
    } else if (gameId.startsWith('local-')) {
      const savedGame = localStorage.getItem('currentGame');
      if (savedGame) {
        const gameData = JSON.parse(savedGame);
        setIsLocalGame(true);
        setGame(gameData);
        setBoard(gameData.board);
        setMessage('👥 Local Game - Player 1 (❌) to move');
      }
    } else {
      // Online game
      loadGame();
    }
    setupEventListeners();
  }, [gameId]);

  const setupEventListeners = () => {
    if (!gameContract) return;

    gameContract.on('MoveMade', (gId, player, position) => {
      if (gId.toString() === gameId.toString()) {
        loadGame();
      }
    });

    gameContract.on('GameFinished', (gId, winner, prize) => {
      if (gId.toString() === gameId.toString()) {
        loadGame();
        const prizeEth = ethers.formatEther(prize);
        setMessage(`🎉 Game Over! Winner: ${formatAddress(winner)} (Prize: ${prizeEth} ETH)`);
      }
    });

    gameContract.on('GameDraw', (gId) => {
      if (gId.toString() === gameId.toString()) {
        loadGame();
        setMessage('🤝 Game ended in a draw!');
      }
    });

    return () => {
      gameContract.removeAllListeners('MoveMade');
      gameContract.removeAllListeners('GameFinished');
      gameContract.removeAllListeners('GameDraw');
    };
  };

  const loadGame = async () => {
    try {
      const gameData = await gameContract.getGame(gameId);
      const boardData = await gameContract.getBoard(gameId);
      
      setGame({
        playerX: gameData[0],
        playerO: gameData[1],
        betAmount: gameData[2],
        currentTurn: gameData[4],
        winner: gameData[5],
        status: gameData[6]
      });
      
      setBoard(boardData.map(cell => Number(cell)));
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const makeMove = async (position) => {
    if (loading || !canMakeMove(position)) return;

    try {
      setLoading(true);
      
      // Handle AI and Local games
      if (isAIGame) {
        handleAIMove(position);
        return;
      }
      
      if (isLocalGame) {
        handleLocalMove(position);
        return;
      }

      // Online blockchain game
      setMessage('🔄 Processing move...');
      
      const tx = await gameContract.makeMove(gameId, position);
      await tx.wait();
      
      setMessage('✅ Move made successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error making move:', error);
      setMessage('❌ Failed to make move. ' + (error.reason || error.message));
      setLoading(false);
    }
  };

  const handleAIMove = (position) => {
    // Player makes move
    const newBoard = [...board];
    newBoard[position] = 1; // Player is X
    
    // Check if player won
    const playerWon = TicTacToeAI.checkWinner(newBoard) === 1;
    if (playerWon) {
      setBoard(newBoard);
      setMessage('🎉 You Won! Congratulations!');
      setLoading(false);
      return;
    }
    
    // Check for draw
    if (TicTacToeAI.isBoardFull(newBoard)) {
      setBoard(newBoard);
      setMessage('🤝 Draw! Well played!');
      setLoading(false);
      return;
    }
    
    // AI makes move
    setTimeout(() => {
      const aiPosition = TicTacToeAI.getBestMoveWithDifficulty(newBoard, 2, aiDifficulty);
      newBoard[aiPosition] = 2; // AI is O
      
      const aiWon = TicTacToeAI.checkWinner(newBoard) === 2;
      if (aiWon) {
        setBoard(newBoard);
        setMessage('🤖 AI Won! Try again!');
      } else if (TicTacToeAI.isBoardFull(newBoard)) {
        setBoard(newBoard);
        setMessage('🤝 Draw!');
      } else {
        setBoard(newBoard);
        setMessage('🤖 AI played. Your turn!');
      }
      setLoading(false);
    }, 500);
  };

  const handleLocalMove = (position) => {
    const newBoard = [...board];
    const player = localCurrentPlayer;
    newBoard[position] = player;
    
    // Check winner
    const winner = TicTacToeAI.checkWinner(newBoard);
    if (winner !== 0) {
      setBoard(newBoard);
      const playerName = winner === 1 ? 'Player 1 (❌)' : 'Player 2 (⭕)';
      setMessage(`🎉 ${playerName} Won!`);
      setLoading(false);
      return;
    }
    
    // Check draw
    if (TicTacToeAI.isBoardFull(newBoard)) {
      setBoard(newBoard);
      setMessage('🤝 Draw!');
      setLoading(false);
      return;
    }
    
    // Switch player
    const nextPlayer = player === 1 ? 2 : 1;
    const nextPlayerName = nextPlayer === 1 ? 'Player 1 (❌)' : 'Player 2 (⭕)';
    setBoard(newBoard);
    setLocalCurrentPlayer(nextPlayer);
    setMessage(`👥 ${nextPlayerName}'s turn`);
    setLoading(false);
  };

  const canMakeMove = (position) => {
    if (board[position] !== 0) return false;
    
    // AI game - only allow moves on player's turn
    if (isAIGame) {
      return board.filter(cell => cell !== 0).length % 2 === 0; // Player goes on even turns
    }
    
    // Local game - allow any valid move
    if (isLocalGame) {
      return true;
    }
    
    // Online game - check contract rules
    if (!game || game.status !== 1) return false; // 1 = IN_PROGRESS
    
    const isPlayerX = game.playerX.toLowerCase() === account.toLowerCase();
    const isPlayerO = game.playerO.toLowerCase() === account.toLowerCase();
    
    if (!isPlayerX && !isPlayerO) return false;
    
    if (game.currentTurn === 1 && !isPlayerX) return false; // PLAYER_X turn
    if (game.currentTurn === 2 && !isPlayerO) return false; // PLAYER_O turn
    
    return true;
  };

  const getCellSymbol = (value) => {
    if (value === 1) return 'X';
    if (value === 2) return 'O';
    return '';
  };

  const getCellClass = (value) => {
    if (value === 1) return 'cell-x';
    if (value === 2) return 'cell-o';
    return '';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getStatusText = () => {
    if (!game) return 'Loading...';
    
    if (game.status === 0) return 'Waiting for opponent...';
    if (game.status === 2) {
      if (game.winner === 0) return 'Game ended in a draw';
      const winnerAddr = game.winner === 1 ? game.playerX : game.playerO;
      return `Winner: ${formatAddress(winnerAddr)}`;
    }
    if (game.status === 3) return 'Game cancelled';
    
    if (!account) return '⏳ Loading...';
    
    const isYourTurn = (game.currentTurn === 1 && game.playerX && game.playerX.toLowerCase() === account.toLowerCase()) ||
                       (game.currentTurn === 2 && game.playerO && game.playerO.toLowerCase() === account.toLowerCase());
    
    return isYourTurn ? '🎯 Your turn!' : '⏳ Opponent\'s turn...';
  };

  if (!game) {
    return (
      <div className="game-board-container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="game-board-container">
      <div className="game-header">
        <button className="btn-back" onClick={onBack}>← Back to Lobby</button>
        <h2>Game #{gameId}</h2>
      </div>

      <div className="game-info">
        <div className="player-info">
          <div className="player player-x">
            <span className="player-symbol">❌</span>
            <span className="player-address">{formatAddress(game.playerX)}</span>
            {game.playerX && account && game.playerX.toLowerCase() === account.toLowerCase() && <span className="badge">You</span>}
          </div>
          <div className="vs">VS</div>
          <div className="player player-o">
            <span className="player-symbol">⭕</span>
            <span className="player-address">
              {game.playerO !== ethers.ZeroAddress ? formatAddress(game.playerO) : 'Waiting...'}
            </span>
            {game.playerO && account && game.playerO.toLowerCase() === account.toLowerCase() && <span className="badge">You</span>}
          </div>
        </div>

        {game.betAmount > 0 && (
          <div className="bet-info">
            💰 Bet: {ethers.formatEther(game.betAmount)} ETH
          </div>
        )}

        <div className="game-status">
          {getStatusText()}
        </div>

        {message && <div className="message">{message}</div>}
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${getCellClass(cell)} ${canMakeMove(index) ? 'clickable' : ''}`}
            onClick={() => makeMove(index)}
          >
            {getCellSymbol(cell)}
          </div>
        ))}
      </div>

      {game.status === 2 && (
        <div className="game-over">
          <h3>🎮 Game Over!</h3>
          {game.winner === 0 ? (
            <p>It's a draw! 🤝</p>
          ) : (
            <>
              <p>Winner: {game.winner === 1 ? '❌' : '⭕'}</p>
              {game.betAmount > 0 && (
                <p className="prize">
                  Prize: {ethers.formatEther(game.betAmount * 2n)} ETH 💰
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
