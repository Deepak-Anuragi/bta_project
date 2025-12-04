import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TournamentList.css';

const TournamentList = ({ tournamentContract, account }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    entryFee: '0.01',
    maxPlayers: '4'
  });

  useEffect(() => {
    loadTournaments();
    setupEventListeners();
  }, []);

  const setupEventListeners = () => {
    if (!tournamentContract) return;

    tournamentContract.on('TournamentCreated', () => {
      loadTournaments();
    });

    tournamentContract.on('PlayerRegistered', () => {
      loadTournaments();
    });

    tournamentContract.on('TournamentFinished', (tournamentId, winner, prize) => {
      loadTournaments();
      setMessage(`🏆 Tournament #${tournamentId} finished! Winner: ${formatAddress(winner)}`);
    });

    return () => {
      tournamentContract.removeAllListeners();
    };
  };

  const loadTournaments = async () => {
    try {
      const activeTournamentIds = await tournamentContract.getActiveTournaments();
      const tournamentsData = [];

      for (let tournamentId of activeTournamentIds) {
        const tournament = await tournamentContract.tournaments(tournamentId);
        const players = await tournamentContract.getTournamentPlayers(tournamentId);

        tournamentsData.push({
          id: tournamentId.toString(),
          name: tournament[0],
          creator: tournament[1],
          entryFee: tournament[2],
          prizePool: tournament[3],
          maxPlayers: Number(tournament[4]),
          gamesPlayed: Number(tournament[5]),
          totalGamesToPlay: Number(tournament[6]),
          status: Number(tournament[7]),
          players: players
        });
      }

      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const createTournament = async () => {
    try {
      setLoading(true);
      setMessage('🔄 Creating tournament...');

      const entryFeeWei = ethers.parseEther(formData.entryFee);
      const tx = await tournamentContract.createTournament(
        formData.name,
        entryFeeWei,
        formData.maxPlayers
      );
      await tx.wait();

      setMessage('✅ Tournament created successfully!');
      setShowCreateForm(false);
      setFormData({ name: '', entryFee: '0.01', maxPlayers: '4' });
      setLoading(false);
      loadTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
      setMessage('❌ Failed to create tournament. ' + (error.reason || error.message));
      setLoading(false);
    }
  };

  const registerForTournament = async (tournamentId, entryFee) => {
    try {
      setLoading(true);
      setMessage('🔄 Registering for tournament...');

      const tx = await tournamentContract.registerForTournament(tournamentId, {
        value: entryFee
      });
      await tx.wait();

      setMessage('✅ Successfully registered!');
      setLoading(false);
      loadTournaments();
    } catch (error) {
      console.error('Error registering:', error);
      setMessage('❌ Failed to register. ' + (error.reason || error.message));
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getStatusText = (status) => {
    const statuses = ['🟢 Registration Open', '🔴 In Progress', '✅ Finished'];
    return statuses[status] || 'Unknown';
  };

  const isRegistered = (tournament) => {
    return tournament.players.some(
      player => player.toLowerCase() === account.toLowerCase()
    );
  };

  return (
    <div className="tournament-container">
      <div className="tournament-header">
        <h2>🏆 Tournaments</h2>
        <button 
          className="btn-create-tournament"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✖️ Cancel' : '➕ Create Tournament'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-tournament-form">
          <h3>Create New Tournament</h3>
          <div className="form-group">
            <label>Tournament Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Epic Championship"
            />
          </div>
          <div className="form-group">
            <label>Entry Fee (ETH)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.entryFee}
              onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Max Players</label>
            <select
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
            >
              <option value="2">2 Players</option>
              <option value="4">4 Players</option>
              <option value="8">8 Players</option>
              <option value="16">16 Players</option>
            </select>
          </div>
          <button 
            className="btn-primary"
            onClick={createTournament}
            disabled={loading || !formData.name}
          >
            {loading ? '⏳ Creating...' : '🎯 Create Tournament'}
          </button>
        </div>
      )}

      {message && <div className="message">{message}</div>}

      <div className="tournaments-list">
        {tournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No active tournaments. Create one to get started!</p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              <div className="tournament-header-info">
                <h3>{tournament.name}</h3>
                <span className="status-badge">{getStatusText(tournament.status)}</span>
              </div>
              
              <div className="tournament-details">
                <div className="detail-row">
                  <span className="label">Tournament ID:</span>
                  <span className="value">#{tournament.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Entry Fee:</span>
                  <span className="value">{ethers.formatEther(tournament.entryFee)} ETH</span>
                </div>
                <div className="detail-row">
                  <span className="label">Prize Pool:</span>
                  <span className="value prize">💰 {ethers.formatEther(tournament.prizePool)} ETH</span>
                </div>
                <div className="detail-row">
                  <span className="label">Players:</span>
                  <span className="value">
                    {tournament.players.length} / {tournament.maxPlayers}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Creator:</span>
                  <span className="value">{formatAddress(tournament.creator)}</span>
                </div>
                {tournament.status === 1 && (
                  <div className="detail-row">
                    <span className="label">Progress:</span>
                    <span className="value">
                      {tournament.gamesPlayed} / {tournament.totalGamesToPlay} Games
                    </span>
                  </div>
                )}
              </div>

              <div className="tournament-players">
                <h4>Registered Players:</h4>
                <div className="players-grid">
                  {tournament.players.map((player, index) => (
                    <div key={index} className="player-badge">
                      {formatAddress(player)}
                      {player.toLowerCase() === account.toLowerCase() && (
                        <span className="you-badge">You</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {tournament.status === 0 && !isRegistered(tournament) && (
                <button
                  className="btn-register"
                  onClick={() => registerForTournament(tournament.id, tournament.entryFee)}
                  disabled={loading || tournament.players.length >= tournament.maxPlayers}
                >
                  {tournament.players.length >= tournament.maxPlayers 
                    ? '🔒 Full' 
                    : '✅ Register'}
                </button>
              )}

              {isRegistered(tournament) && (
                <div className="registered-badge">
                  ✅ You're registered!
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentList;
