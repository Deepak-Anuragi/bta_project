import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { savePlayerStats, getPlayerStats, saveWalletData, getAchievements, unlockAchievement } from '../utils/localStorage';
import './PlayerStats.css';

const PlayerStats = ({ gameContract, nftContract, account }) => {
  const [stats, setStats] = useState({
    totalWins: 0,
    totalGames: 0,
    totalLosses: 0,
    balance: '0',
    walletBalance: '0',
    totalEarned: '0',
    totalSpent: '0',
    nftCount: 0,
    winRate: 0,
    longestWinStreak: 0,
    level: 1,
    experience: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [account]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const wins = await gameContract.playerWins(account);
      const games = await gameContract.getPlayerGames(account);
      const balance = await gameContract.playerBalance(account);
      const nftBalance = await nftContract.balanceOf(account);
      
      // Get wallet balance from provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const walletBal = await provider.getBalance(account);

      const totalWins = Number(wins);
      const onlineGames = games.length; // Only online games tracked on contract
      const totalLosses = Math.max(0, onlineGames - totalWins); // Don't show negative
      const totalGames = onlineGames; // Only count online games in stats
      const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;
      const balanceEth = ethers.formatEther(balance);
      const walletBalEth = ethers.formatEther(walletBal);

      // Calculate level based on wins (only online wins count)
      const level = Math.floor(totalWins / 5) + 1;
      const experience = (totalWins % 5) * 20;

      const newStats = {
        totalWins,
        totalGames,
        totalLosses,
        balance: balanceEth,
        walletBalance: walletBalEth,
        totalEarned: balanceEth, // Can be enhanced with bet tracking
        totalSpent: '0', // Can be enhanced with bet tracking
        nftCount: Number(nftBalance),
        winRate: parseFloat(winRate),
        longestWinStreak: 0, // Can be enhanced with game history tracking
        level,
        experience
      };

      setStats(newStats);
      
      // Save to localStorage
      savePlayerStats(account, newStats);
      saveWalletData(account, {
        balance: balanceEth,
        totalEarned: balanceEth,
        totalSpent: '0',
        nativeBalance: walletBalEth
      });

      // Check and unlock achievements (only for online games)
      const playerAchievements = getAchievements(account);
      setAchievements(playerAchievements);
      checkAndUnlockAchievements(totalWins, totalGames, playerAchievements);

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const checkAndUnlockAchievements = (wins, games, currentAchievements) => {
    const achievementsList = [
      { id: 'first_win', name: 'First Blood', requirement: wins >= 1, icon: '🥉' },
      { id: 'five_wins', name: '5 Wins', requirement: wins >= 5, icon: '🥈' },
      { id: 'ten_wins', name: '10 Wins', requirement: wins >= 10, icon: '🥇' },
      { id: 'twenty_wins', name: 'Veteran', requirement: wins >= 20, icon: '👑' },
      { id: 'hundred_games', name: 'Century Player', requirement: games >= 100, icon: '💯' },
      { id: 'perfect_week', name: 'Hot Streak', requirement: wins >= 5 && games >= 5, icon: '🔥' }
    ];

    achievementsList.forEach(ach => {
      if (ach.requirement && !currentAchievements.find(a => a.id === ach.id)) {
        unlockAchievement(account, ach.id, { name: ach.name, icon: ach.icon });
      }
    });
  };

  const withdrawBalance = async () => {
    try {
      const tx = await gameContract.withdraw();
      await tx.wait();
      alert('✅ Withdrawal successful!');
      loadStats();
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('❌ Withdrawal failed: ' + (error.reason || error.message));
    }
  };

  const winRate = stats.totalGames > 0 
    ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2>📊 Player Statistics</h2>
        <p className="account-address">{account}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalWins}</div>
            <div className="stat-label">Total Wins</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalGames}</div>
            <div className="stat-label">Online Games</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">Win Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-info">
            <div className="stat-value">{stats.nftCount}</div>
            <div className="stat-label">NFTs Earned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚔️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalLosses}</div>
            <div className="stat-label">Losses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">Lvl {stats.level}</div>
            <div className="stat-label">Player Level</div>
          </div>
        </div>
      </div>

      <div className="level-section">
        <div className="level-display">
          <div className="level-header">
            <h3>⭐ Level {stats.level}</h3>
            <p className="next-level">Next: Level {stats.level + 1}</p>
          </div>
          <div className="experience-bar">
            <div className="exp-fill" style={{width: `${stats.experience}%`}}></div>
            <span className="exp-text">{stats.experience}/100 XP</span>
          </div>
        </div>
      </div>

      <div className="balance-section">
        <h3>💰 Wallet & Winnings</h3>
        <div className="balance-display">
          <div className="balance-item">
            <span className="balance-label">Wallet:</span>
            <span className="balance-amount">{stats.walletBalance} Sepolia ETH</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Winnings:</span>
            <span className="balance-amount">{stats.balance} Sepolia ETH</span>
            {parseFloat(stats.balance) > 0 && (
              <button className="btn-withdraw" onClick={withdrawBalance}>
                💸 Withdraw
              </button>
            )}
          </div>
        </div>
        <p className="balance-note">
          Your wallet balance shows your Sepolia testnet funds. Winnings are accumulated game earnings that can be withdrawn.
        </p>
      </div>

      <div className="achievements-section">
        <h3>🎖️ Achievements</h3>
        <div className="achievements-grid">
          <div className={`achievement ${stats.totalWins >= 1 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🥉</span>
            <span className="achievement-name">First Win</span>
          </div>
          <div className={`achievement ${stats.totalWins >= 5 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🥈</span>
            <span className="achievement-name">5 Wins</span>
          </div>
          <div className={`achievement ${stats.totalWins >= 10 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🥇</span>
            <span className="achievement-name">10 Wins</span>
          </div>
          <div className={`achievement ${stats.totalWins >= 25 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">👑</span>
            <span className="achievement-name">Champion</span>
          </div>
          <div className={`achievement ${stats.nftCount >= 5 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🎨</span>
            <span className="achievement-name">Collector</span>
          </div>
          <div className={`achievement ${winRate >= 70 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">⭐</span>
            <span className="achievement-name">Pro Player</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
