import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './GameLobby.css';

const GameLobby = ({ gameContract, account, onGameSelect }) => {
  const [availableGames, setAvailableGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [betAmount, setBetAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [gameMode, setGameMode] = useState('online'); // 'online', 'ai', or 'local'
  // eslint-disable-next-line no-unused-vars
  const [aiDifficulty, setAiDifficulty] = useState('hard'); // 'easy', 'medium', 'hard'

  useEffect(() => {
    if (gameContract && account) {
      loadGames();
      setupEventListeners();
    }
  }, [gameContract, account]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const setupEventListeners = () => {
    if (!gameContract) return;

    // Debounce game loading to prevent too many RPC calls
    let loadTimeout;
    const debouncedLoad = () => {
      clearTimeout(loadTimeout);
      loadTimeout = setTimeout(() => loadGames(), 1000);
    };

    gameContract.on('GameCreated', debouncedLoad);
    gameContract.on('GameJoined', debouncedLoad);

    return () => {
      clearTimeout(loadTimeout);
      gameContract.removeAllListeners('GameCreated');
      gameContract.removeAllListeners('GameJoined');
    };
  };

  const loadGames = async () => {
    if (isLoadingGames || !gameContract || !account) return;
    
    try {
      setIsLoadingGames(true);
      
      // Load available games with rate limiting
      const available = await gameContract.getAvailableGames();
      const availableGamesData = [];

      // Limit to first 20 games to prevent too many RPC calls
      const gamesToLoad = available.slice(0, 20);
      
      for (let gameId of gamesToLoad) {
        try {
          const game = await gameContract.getGame(gameId);
          availableGamesData.push({
            id: gameId.toString(),
            playerX: game[0],
            betAmount: game[2],
            createdAt: game[7]
          });
          // Small delay between calls to prevent overwhelming the node
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`Error loading game ${gameId}:`, err);
        }
      }

      setAvailableGames(availableGamesData);

      // Load my games
      const myGameIds = await gameContract.getPlayerGames(account);
      const myGamesData = [];

      for (let gameId of myGameIds) {
        try {
          const game = await gameContract.getGame(gameId);
          myGamesData.push({
            id: gameId.toString(),
            playerX: game[0],
            playerO: game[1],
            betAmount: game[2],
            status: game[6],
            winner: game[5]
          });
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`Error loading game ${gameId}:`, err);
        }
      }

      setMyGames(myGamesData);
    } catch (error) {
      console.error('Error loading games:', error);
      setMessage('⚠️ Error loading games. Please refresh.');
    } finally {
      setIsLoadingGames(false);
    }
  };

  const createGame = async () => {
    try {
      setLoading(true);
      setMessage('🔄 Creating game...');

      // If AI or local mode, create a special game locally
      if (gameMode === 'ai') {
        const gameData = {
          id: 'ai-' + Date.now(),
          mode: 'ai',
          difficulty: aiDifficulty,
          playerX: account,
          playerO: null,
          betAmount: 0,
          board: Array(9).fill(0),
          currentTurn: 1, // Player X starts
          status: 'IN_PROGRESS',
          isAI: true
        };
        localStorage.setItem('currentGame', JSON.stringify(gameData));
        onGameSelect(gameData.id);
        setMessage('');
        return;
      }

      if (gameMode === 'local') {
        const gameData = {
          id: 'local-' + Date.now(),
          mode: 'local',
          playerX: 'Player 1',
          playerO: 'Player 2',
          betAmount: 0,
          board: Array(9).fill(0),
          currentTurn: 1,
          status: 'IN_PROGRESS',
          isLocal: true
        };
        localStorage.setItem('currentGame', JSON.stringify(gameData));
        onGameSelect(gameData.id);
        setMessage('');
        return;
      }

      // Online mode (blockchain)
      const betWei = ethers.parseEther(betAmount || '0');
      
      // Let MetaMask estimate gas automatically
      const tx = await gameContract.createGame(betWei, { 
        value: betWei
      });
      
      setMessage('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setMessage('✅ Game created successfully!');
        setBetAmount('0');
        // Wait a bit before reloading to let the blockchain settle
        setTimeout(() => loadGames(), 1500);
      } else {
        setMessage('❌ Transaction failed');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating game:', error);
      setLoading(false);
      
      let errorMsg = '❌ Failed to create game. ';
      if (error.code === 'UNKNOWN_ERROR') {
        errorMsg += 'RPC error - please wait a moment and try again.';
      } else if (error.reason) {
        errorMsg += error.reason;
      } else if (error.message) {
        errorMsg += error.message.substring(0, 100);
      }
      
      setMessage(errorMsg);
    }
  };

  const joinGame = async (gameId, betAmount) => {
    try {
      setLoading(true);
      setMessage('🔄 Joining game...');

      const tx = await gameContract.joinGame(gameId, { value: betAmount });
      await tx.wait();

      setMessage('✅ Joined game successfully!');
      setLoading(false);
      loadGames();
      onGameSelect(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      setMessage('❌ Failed to join game. ' + (error.reason || error.message));
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getStatusText = (status) => {
    const statuses = ['Waiting', 'In Progress', 'Finished', 'Cancelled'];
    return statuses[status] || 'Unknown';
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h2>🏠 Game Lobby</h2>
        <p>Create a new game or join an existing one!</p>
      </div>

      <div className="create-game-section">
        <h3>Create New Game</h3>
        
        {/* Game Mode Selection */}
        <div className="game-mode-selector">
          <label>Game Mode</label>
          <div className="mode-buttons">
            <button 
              className={`mode-btn ${gameMode === 'online' ? 'active' : ''}`}
              onClick={() => setGameMode('online')}
              title="Play with another real player on blockchain"
            >
              🌐 Online (Multiplayer)
            </button>
            <button 
              className={`mode-btn ${gameMode === 'ai' ? 'active' : ''}`}
              onClick={() => setGameMode('ai')}
              title="Play against AI engine"
            >
              🤖 AI Opponent
            </button>
            <button 
              className={`mode-btn ${gameMode === 'local' ? 'active' : ''}`}
              onClick={() => setGameMode('local')}
              title="Two players on same device"
            >
              👥 Local (2 Players)
            </button>
          </div>
        </div>

        {/* AI Difficulty Selection */}
        {gameMode === 'ai' && (
          <div className="ai-difficulty-selector">
            <label>AI Difficulty</label>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn ${aiDifficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setAiDifficulty('easy')}
              >
                😊 Easy
              </button>
              <button 
                className={`difficulty-btn ${aiDifficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setAiDifficulty('medium')}
              >
                😐 Medium
              </button>
              <button 
                className={`difficulty-btn ${aiDifficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setAiDifficulty('hard')}
              >
                🤯 Hard
              </button>
            </div>
          </div>
        )}

        {/* Bet Amount - Only for Online Mode */}
        {gameMode === 'online' && (
          <div className="create-form">
            <div className="input-group">
              <label>Bet Amount (ETH)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0 for free game"
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={createGame}
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '🎮 Create Game'}
            </button>
          </div>
        )}

        {/* Create Button for AI and Local */}
        {(gameMode === 'ai' || gameMode === 'local') && (
          <button 
            className="btn-primary full-width"
            onClick={createGame}
            disabled={loading}
          >
            {gameMode === 'ai' ? '🤖 Play vs AI' : '👥 Start Local Game'}
          </button>
        )}

        {message && <div className="message">{message}</div>}
      </div>

      <div className="games-section">
        <div className="tabs">
          <button 
            className={activeTab === 'available' ? 'active' : ''}
            onClick={() => setActiveTab('available')}
          >
            🌐 Available Games ({availableGames.length})
          </button>
          <button 
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            👤 My Games ({myGames.length})
          </button>
        </div>

        <div className="games-list">
          {activeTab === 'available' && (
            <>
              {availableGames.length === 0 ? (
                <div className="no-games">
                  <p>No available games. Create one to get started!</p>
                </div>
              ) : (
                availableGames.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-info">
                      <div className="game-id">Game #{game.id}</div>
                      <div className="player-info">
                        <span>Creator: {formatAddress(game.playerX)}</span>
                      </div>
                      <div className="bet-info">
                        💰 Bet: {ethers.formatEther(game.betAmount)} ETH
                      </div>
                    </div>
                    <button
                      className="btn-join"
                      onClick={() => joinGame(game.id, game.betAmount)}
                      disabled={loading || game.playerX.toLowerCase() === account.toLowerCase()}
                    >
                      {game.playerX.toLowerCase() === account.toLowerCase() ? 'Your Game' : '▶️ Join'}
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'my' && (
            <>
              {myGames.length === 0 ? (
                <div className="no-games">
                  <p>You haven't played any games yet.</p>
                </div>
              ) : (
                myGames.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-info">
                      <div className="game-id">Game #{game.id}</div>
                      <div className="player-info">
                        <span>❌ {formatAddress(game.playerX)}</span>
                        <span className="vs">vs</span>
                        <span>⭕ {game.playerO !== ethers.ZeroAddress ? formatAddress(game.playerO) : 'Waiting...'}</span>
                      </div>
                      <div className="bet-info">
                        💰 {ethers.formatEther(game.betAmount)} ETH
                      </div>
                      <div className={`status status-${game.status}`}>
                        {getStatusText(game.status)}
                      </div>
                    </div>
                    <button
                      className="btn-view"
                      onClick={() => onGameSelect(game.id)}
                    >
                      👁️ View
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
