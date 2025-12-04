export const GAME_ABI = [
  "function createGame(uint256 betAmount) external payable returns (uint256)",
  "function joinGame(uint256 gameId) external payable",
  "function makeMove(uint256 gameId, uint256 position) external",
  "function withdraw() external",
  "function getGame(uint256 gameId) external view returns (tuple(address playerX, address playerO, uint256 betAmount, uint8[9] board, uint8 currentTurn, uint8 winner, uint8 status, uint256 createdAt, bool isTournament, uint256 tournamentId))",
  "function getBoard(uint256 gameId) external view returns (uint8[9])",
  "function getAvailableGames() external view returns (uint256[])",
  "function getPlayerGames(address player) external view returns (uint256[])",
  "function playerBalance(address) external view returns (uint256)",
  "function playerWins(address) external view returns (uint256)",
  "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 betAmount)",
  "event GameJoined(uint256 indexed gameId, address indexed joiner)",
  "event MoveMade(uint256 indexed gameId, address indexed player, uint256 position)",
  "event GameFinished(uint256 indexed gameId, address indexed winner, uint256 prize)",
  "event GameDraw(uint256 indexed gameId)"
];

export const NFT_ABI = [
  "function getNFTMetadata(uint256 tokenId) external view returns (tuple(uint8 rarity, uint256 wins, uint256 timestamp, string achievement))",
  "function playerWins(address) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "event NFTMinted(address indexed player, uint256 tokenId, uint8 rarity, string achievement)"
];

export const TOURNAMENT_ABI = [
  "function createTournament(string memory name, uint256 entryFee, uint256 maxPlayers) external returns (uint256)",
  "function registerForTournament(uint256 tournamentId) external payable",
  "function startTournament(uint256 tournamentId) external",
  "function getTournamentPlayers(uint256 tournamentId) external view returns (address[])",
  "function getPlayerScore(uint256 tournamentId, address player) external view returns (uint256)",
  "function getActiveTournaments() external view returns (uint256[])",
  "function tournaments(uint256) external view returns (string memory name, address creator, uint256 entryFee, uint256 prizePool, uint256 maxPlayers, uint256 gamesPlayed, uint256 totalGamesToPlay, uint8 status, uint256 createdAt, address winner)",
  "event TournamentCreated(uint256 indexed tournamentId, string name, address creator, uint256 entryFee, uint256 maxPlayers)",
  "event PlayerRegistered(uint256 indexed tournamentId, address indexed player)",
  "event TournamentStarted(uint256 indexed tournamentId)",
  "event TournamentFinished(uint256 indexed tournamentId, address indexed winner, uint256 prize)"
];
