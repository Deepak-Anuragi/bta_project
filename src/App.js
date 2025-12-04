import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, MIN_BET } from './config';
import { GAME_ABI, NFT_ABI, TOURNAMENT_ABI } from './contracts';
import GameBoard from './components/GameBoard';
import GameLobby from './components/GameLobby';
import TournamentList from './components/TournamentList';
import PlayerStats from './components/PlayerStats';
import NFTGallery from './components/NFTGallery';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [tournamentContract, setTournamentContract] = useState(null);
  const [currentView, setCurrentView] = useState('lobby');
  const [currentGameId, setCurrentGameId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        alert('Please install MetaMask! Visit https://metamask.io to install.');
        setLoading(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected accounts:', accounts);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.chainId);

      // Check if connected to Sepolia (chain ID 11155111)
      if (network.chainId !== 11155111n) {
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }] // Sepolia chain ID
          });
        } catch (switchError) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Testnet',
                  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  }
                }]
              });
            } catch (addError) {
              alert('Failed to add Sepolia network. Please add it manually in MetaMask.');
              setLoading(false);
              return;
            }
          } else {
            alert('Please switch to Sepolia Testnet in MetaMask.');
            setLoading(false);
            return;
          }
        }
      }

      const signer = await provider.getSigner();

      // Initialize contracts
      const game = new ethers.Contract(CONTRACT_ADDRESSES.gameContract, GAME_ABI, signer);
      const nft = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, NFT_ABI, signer);
      const tournament = new ethers.Contract(CONTRACT_ADDRESSES.tournamentContract, TOURNAMENT_ABI, signer);

      setAccount(accounts[0]);
      setProvider(provider);
      setGameContract(game);
      setNftContract(nft);
      setTournamentContract(tournament);
      setLoading(false);
      
      console.log('Wallet connected successfully to Sepolia!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLoading(false);
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the connection in MetaMask.');
      } else if (error.code === -32002) {
        alert('Connection request already pending. Please check MetaMask.');
      } else {
        alert(`Failed to connect wallet: ${error.message}`);
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🎮 Blockchain Tic-Tac-Toe</h1>
          <div className="header-actions">
            {account ? (
              <div className="wallet-info">
                <span className="wallet-badge">🟢 {formatAddress(account)}</span>
              </div>
            ) : (
              <button className="btn-connect" onClick={connectWallet} disabled={loading}>
                {loading ? 'Connecting...' : '🔗 Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {account ? (
        <div className="main-content">
          <nav className="nav-menu">
            <button 
              className={currentView === 'lobby' ? 'active' : ''} 
              onClick={() => setCurrentView('lobby')}
            >
              🏠 Lobby
            </button>
            <button 
              className={currentView === 'game' ? 'active' : ''} 
              onClick={() => setCurrentView('game')}
              disabled={!currentGameId}
            >
              🎯 Game
            </button>
            <button 
              className={currentView === 'tournaments' ? 'active' : ''} 
              onClick={() => setCurrentView('tournaments')}
            >
              🏆 Tournaments
            </button>
            <button 
              className={currentView === 'nfts' ? 'active' : ''} 
              onClick={() => setCurrentView('nfts')}
            >
              🎨 My NFTs
            </button>
            <button 
              className={currentView === 'stats' ? 'active' : ''} 
              onClick={() => setCurrentView('stats')}
            >
              📊 Stats
            </button>
          </nav>

          <div className="content-area">
            {currentView === 'lobby' && (
              <GameLobby
                gameContract={gameContract}
                account={account}
                onGameSelect={(gameId) => {
                  setCurrentGameId(gameId);
                  setCurrentView('game');
                }}
              />
            )}

            {currentView === 'game' && currentGameId && (
              <GameBoard
                gameContract={gameContract}
                gameId={currentGameId}
                account={account}
                onBack={() => {
                  setCurrentView('lobby');
                  setCurrentGameId(null);
                }}
              />
            )}

            {currentView === 'tournaments' && (
              <TournamentList
                tournamentContract={tournamentContract}
                account={account}
              />
            )}

            {currentView === 'nfts' && (
              <NFTGallery
                nftContract={nftContract}
                account={account}
              />
            )}

            {currentView === 'stats' && (
              <PlayerStats
                gameContract={gameContract}
                nftContract={nftContract}
                account={account}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="welcome-screen">
          <div className="welcome-card">
            <h2>Welcome to Blockchain Tic-Tac-Toe! 🎮</h2>
            <p>Connect your wallet to start playing</p>
            <ul className="features-list">
              <li>✅ On-chain validated moves</li>
              <li>💰 Bet tokens on matches</li>
              <li>🏆 Join decentralized tournaments</li>
              <li>🎨 Earn NFT rewards for winning</li>
            </ul>
            <button className="btn-primary" onClick={connectWallet} disabled={loading}>
              {loading ? 'Connecting...' : '🚀 Get Started'}
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Built with ❤️ on the Blockchain | Secure • Transparent • Decentralized</p>
      </footer>
    </div>
  );
}

export default App;
