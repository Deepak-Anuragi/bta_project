import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './NFTGallery.css';

const NFTGallery = ({ nftContract, account }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
    
    // Listen for new NFT mints
    const handleNFTMinted = (player, tokenId, rarity, achievement) => {
      if (player.toLowerCase() === account.toLowerCase()) {
        console.log('New NFT minted!', tokenId.toString());
        loadNFTs(); // Refresh the gallery
      }
    };
    
    if (nftContract) {
      nftContract.on('NFTMinted', handleNFTMinted);
    }
    
    return () => {
      if (nftContract) {
        nftContract.off('NFTMinted', handleNFTMinted);
      }
    };
  }, [account, nftContract]);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const balance = await nftContract.balanceOf(account);
      const nftData = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
        const metadata = await nftContract.getNFTMetadata(tokenId);

        nftData.push({
          tokenId: tokenId.toString(),
          rarity: Number(metadata[0]),
          wins: Number(metadata[1]),
          timestamp: Number(metadata[2]),
          achievement: metadata[3]
        });
      }

      setNfts(nftData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setLoading(false);
    }
  };

  const getRarityInfo = (rarity) => {
    const rarities = [
      { name: 'Common', color: '#gray', emoji: '🏅', symbol: '🎖️' },
      { name: 'Rare', color: '#CD7F32', emoji: '🥉', symbol: '⭐' },
      { name: 'Epic', color: '#C0C0C0', emoji: '🥈', symbol: '🌟' },
      { name: 'Legendary', color: '#FFD700', emoji: '🥇', symbol: '💫' }
    ];
    return rarities[rarity] || rarities[0];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="nft-gallery-container">
        <div className="loading">Loading NFTs...</div>
      </div>
    );
  }

  return (
    <div className="nft-gallery-container">
      <div className="gallery-header">
        <div>
          <h2>🏅 My Medal Collection</h2>
          <p className="collection-count">
            {nfts.length} Medal{nfts.length !== 1 ? 's' : ''} & Badge{nfts.length !== 1 ? 's' : ''} earned
          </p>
        </div>
        <button 
          className="refresh-nfts-btn" 
          onClick={loadNFTs}
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {nfts.length === 0 ? (
        <div className="no-nfts">
          <div className="empty-state">
            <span className="empty-icon">🏅</span>
            <h3>No Medals Yet</h3>
            <p>Win games to earn medals, badges, and stickers!</p>
          </div>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => {
            const rarityInfo = getRarityInfo(nft.rarity);
            return (
              <div 
                key={nft.tokenId} 
                className={`nft-card rarity-${rarityInfo.name.toLowerCase()}`}
              >
                <div className="nft-image">
                  <div className="nft-trophy">{rarityInfo.emoji}</div>
                  <div className="nft-symbol">{rarityInfo.symbol}</div>
                  <div className="nft-rarity-badge">
                    {rarityInfo.emoji} {rarityInfo.name}
                  </div>
                </div>
                
                <div className="nft-details">
                  <h3 className="nft-title">{nft.achievement}</h3>
                  <div className="nft-stats">
                    <div className="stat">
                      <span className="stat-label">Token ID</span>
                      <span className="stat-value">#{nft.tokenId}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Wins</span>
                      <span className="stat-value">{nft.wins}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Earned On</span>
                      <span className="stat-value">{formatDate(nft.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="nft-glow" style={{ 
                  background: `linear-gradient(135deg, ${rarityInfo.color}33, ${rarityInfo.color}11)` 
                }}></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rarity-guide">
        <h3>Rarity Guide</h3>
        <div className="rarity-items">
          <div className="rarity-item">
            <span>⚪ Common</span>
            <span>Win any game</span>
          </div>
          <div className="rarity-item">
            <span>🔵 Rare</span>
            <span>Win 10+ games</span>
          </div>
          <div className="rarity-item">
            <span>🟣 Epic</span>
            <span>Win 20+ games or 1 tournament</span>
          </div>
          <div className="rarity-item">
            <span>🟡 Legendary</span>
            <span>Win 50+ games or 3 tournaments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTGallery;
