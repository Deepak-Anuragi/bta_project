// localStorage utility for managing game state and user data

const STORAGE_KEYS = {
  USER_PROFILE: 'ticTacToe_userProfile',
  GAME_HISTORY: 'ticTacToe_gameHistory',
  TOURNAMENT_HISTORY: 'ticTacToe_tournamentHistory',
  PLAYER_STATS: 'ticTacToe_playerStats',
  PREFERENCES: 'ticTacToe_preferences',
  ACTIVE_GAMES: 'ticTacToe_activeGames',
  ACHIEVEMENTS: 'ticTacToe_achievements',
  WALLET_DATA: 'ticTacToe_walletData'
};

// User Profile
export const saveUserProfile = (account, data) => {
  const profile = {
    account,
    joinDate: data.joinDate || new Date().toISOString(),
    nickname: data.nickname || '',
    bio: data.bio || '',
    avatar: data.avatar || '🎮',
    lastLogin: new Date().toISOString(),
    totalPlayTime: data.totalPlayTime || 0
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getUserProfile = (account) => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (data) {
    const profile = JSON.parse(data);
    if (profile.account === account) {
      return profile;
    }
  }
  return null;
};

// Game History
export const addGameToHistory = (gameId, gameData) => {
  const history = getGameHistory();
  history.push({
    gameId,
    ...gameData,
    timestamp: new Date().toISOString()
  });
  // Keep only last 100 games
  if (history.length > 100) {
    history.shift();
  }
  localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
};

export const getGameHistory = () => {
  const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
  return data ? JSON.parse(data) : [];
};

export const clearGameHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
};

// Tournament History
export const addTournamentToHistory = (tournamentId, tournamentData) => {
  const history = getTournamentHistory();
  history.push({
    tournamentId,
    ...tournamentData,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEYS.TOURNAMENT_HISTORY, JSON.stringify(history));
};

export const getTournamentHistory = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_HISTORY);
  return data ? JSON.parse(data) : [];
};

// Player Statistics
export const savePlayerStats = (account, stats) => {
  const data = {
    account,
    totalWins: stats.totalWins || 0,
    totalLosses: stats.totalLosses || 0,
    totalGames: stats.totalGames || 0,
    totalBetAmount: stats.totalBetAmount || '0',
    totalWonAmount: stats.totalWonAmount || '0',
    winRate: stats.winRate || 0,
    longestWinStreak: stats.longestWinStreak || 0,
    averageGameDuration: stats.averageGameDuration || 0,
    nftCount: stats.nftCount || 0,
    level: stats.level || 1,
    experience: stats.experience || 0,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(data));
};

export const getPlayerStats = (account) => {
  const data = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
  if (data) {
    const stats = JSON.parse(data);
    if (stats.account === account) {
      return stats;
    }
  }
  return null;
};

// Preferences
export const savePreferences = (account, prefs) => {
  const preferences = {
    account,
    theme: prefs.theme || 'dark',
    soundEnabled: prefs.soundEnabled !== false,
    notificationsEnabled: prefs.notificationsEnabled !== false,
    autoRefresh: prefs.autoRefresh !== false,
    defaultBetAmount: prefs.defaultBetAmount || '0.0001',
    aiDifficulty: prefs.aiDifficulty || 'hard',
    language: prefs.language || 'en'
  };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
};

export const getPreferences = (account) => {
  const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (data) {
    const prefs = JSON.parse(data);
    if (prefs.account === account) {
      return prefs;
    }
  }
  return {
    theme: 'dark',
    soundEnabled: true,
    notificationsEnabled: true,
    autoRefresh: true,
    defaultBetAmount: '0.0001',
    aiDifficulty: 'hard',
    language: 'en'
  };
};

// Active Games
export const saveActiveGame = (gameId, gameData) => {
  const activeGames = getActiveGames();
  const index = activeGames.findIndex(g => g.gameId === gameId);
  if (index > -1) {
    activeGames[index] = { gameId, ...gameData, updatedAt: new Date().toISOString() };
  } else {
    activeGames.push({ gameId, ...gameData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVE_GAMES, JSON.stringify(activeGames));
};

export const getActiveGames = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_GAMES);
  return data ? JSON.parse(data) : [];
};

export const removeActiveGame = (gameId) => {
  const activeGames = getActiveGames().filter(g => g.gameId !== gameId);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_GAMES, JSON.stringify(activeGames));
};

// Achievements
export const unlockAchievement = (account, achievementId, achievementData) => {
  const achievements = getAchievements(account);
  if (!achievements.find(a => a.id === achievementId)) {
    achievements.push({
      id: achievementId,
      ...achievementData,
      unlockedAt: new Date().toISOString()
    });
  }
  const data = {
    account,
    achievements,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data));
};

export const getAchievements = (account) => {
  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (data) {
    const stored = JSON.parse(data);
    if (stored.account === account) {
      return stored.achievements || [];
    }
  }
  return [];
};

// Wallet Data
export const saveWalletData = (account, walletData) => {
  const data = {
    account,
    balance: walletData.balance || '0',
    totalEarned: walletData.totalEarned || '0',
    totalSpent: walletData.totalSpent || '0',
    nativeBalance: walletData.nativeBalance || '0',
    lastChecked: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(data));
};

export const getWalletData = (account) => {
  const data = localStorage.getItem(STORAGE_KEYS.WALLET_DATA);
  if (data) {
    const wallet = JSON.parse(data);
    if (wallet.account === account) {
      return wallet;
    }
  }
  return null;
};

// Clear all data for account
export const clearUserData = (account) => {
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.account === account) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  });
};

// Export all storage keys for reference
export { STORAGE_KEYS };
