import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import image1 from '../assets/images/imgg1.jpg';
import image9 from '../assets/images/img9.jpg';
import image8 from '../assets/images/img8.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image13 from '../assets/images/img13.jpg';
import {
  User, Edit, Trash2, Star, Clock, TrendingUp, BarChart2, DollarSign,
  FileText, Download, Share2, Lock, Unlock, Grid, List, Trophy, Activity,
  GitCommit, Award, Zap, Rocket, Users, Sparkles,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import ChatbotButton from '../pages/ChatbotButton.jsx';
import '../styles/Dashboard.css';

// Reusable Utility Functions
const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();
const formatWalletAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

// Reusable Components
const ProfileCard = ({ profileData, isEditingProfile, setIsEditingProfile, setProfileData, handleProfileUpdate }) => (
  <div className="profile-card glass-effect animated-card">
    <div className="avatar-container">
      <div className="avatar">
        <User size={60} />
        <span className="level-circle">Lv {profileData.level}</span>
      </div>
    </div>
    <div className="profile-info">
      <h2>
        {profileData.username} <span className="level-badge pulse">Creator Level {profileData.level}</span>
      </h2>
      <p className="wallet-address">{formatWalletAddress(profileData.walletAddress)}</p>
      <p className="bio">{profileData.bio}</p>
      <div className="profile-stats">
        <span className="stat tooltip" data-tooltip={`Tokens: ${profileData.tokens}`}>
          <DollarSign size={18} /> {profileData.tokens}
        </span>
        <span className="stat tooltip" data-tooltip={`Streak: ${profileData.streak} days`} style={{ color: '#ff6b6b' }}>
          <Zap size={18} /> {profileData.streak} days
        </span>
        <span className="stat tooltip" data-tooltip={`Contributions: ${profileData.contributions}`}>
          <FileText size={18} /> {profileData.contributions}
        </span>
      </div>
      <div className="progress-bar-container">
        <p>Next Level: {profileData.points}/2000 XP</p>
        <div className="progress-bar">
          <div
            className="progress animated-progress"
            style={{ width: `${(profileData.points / 2000) * 100}%` }}
          />
        </div>
      </div>
      <Button
        variant="gradient"
        onClick={() => setIsEditingProfile(!isEditingProfile)}
        className="edit-profile-btn"
      >
        <Edit size={16} /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
      </Button>
    </div>
    {isEditingProfile && (
      <form onSubmit={handleProfileUpdate} className="profile-edit-form animated-form">
        <div className="form-group">
          <label>Username</label>
          <input
            value={profileData.username}
            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <Button type="submit" variant="gradient">Save Changes</Button>
        </div>
      </form>
    )}
  </div>
);

const PerformanceCard = ({ userPerformance }) => (
  <div className="performance-card glass-effect animated-card">
    <h3 className="card-title"><Trophy size={24} /> Creator Performance</h3>
    <div className="performance-stats">
      <div className="stat-item tooltip" data-tooltip={`Earnings: $${userPerformance.totalEarnings}`}>
        <DollarSign size={20} /> Earnings: ${userPerformance.totalEarnings}
      </div>
      <div className="stat-item tooltip" data-tooltip={`Total Uses: ${userPerformance.totalUses}`}>
        <Download size={20} /> Total Uses: {userPerformance.totalUses}
      </div>
      <div className="stat-item tooltip" data-tooltip={`Rank: #${userPerformance.rank}`}>
        <TrendingUp size={20} /> Rank: #{userPerformance.rank}
      </div>
      <div className="stat-item tooltip" data-tooltip={`Tokens: ${userPerformance.tokensEarned}`}>
        <Award size={20} /> Tokens: {userPerformance.tokensEarned}
      </div>
    </div>
    <div className="achievements">
      <h4>Achievements</h4>
      <div className="achievement-grid">
        {userPerformance.achievements.map((ach, index) => (
          <div key={index} className="achievement-badge animated-badge">
            <Award size={20} /> {ach}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const QuestProgress = ({ profileData }) => (
  <div className="quest-progress glass-effect animated-card">
    <h3 className="card-title"><Sparkles size={24} /> Quest Progress</h3>
    <p className="quest-description">Complete daily quests to earn bonus tokens!</p>
    <div className="quests">
      <div className="quest-item">
        <span>Create a new model</span>
        <Button variant="gradient" className="btn-sm">Claim +50 Tokens</Button>
      </div>
      <div className="quest-item">
        <span>Share a model</span>
        <Button variant="gradient" className="btn-sm">Claim +20 Tokens</Button>
      </div>
    </div>
    <div className="streak-multiplier">
      <p>Streak Multiplier: <span className="highlight">{profileData.streak >= 7 ? '2x' : '1x'}</span></p>
      <div className="progress-bar">
        <div
          className="progress animated-progress"
          style={{ width: `${(profileData.streak / 7) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

const ModelCard = ({ model, viewMode, handleDeleteModel }) => (
  <div className={`model-card glass-effect animated-card ${viewMode}`}>
    <div className="model-image">
      <img src={model.image} alt={model.name} />
      <div className="model-badges">
        <span className={`status ${model.status}`}>
          {model.status === 'published' ? <Unlock size={14} /> : <Lock size={14} />}
          {model.status}
        </span>
        {model.isNFT && <span className="badge nft pulse">NFT</span>}
      </div>
    </div>
    <div className="model-details">
      <h3 className="model-title">{model.name}</h3>
      <p className="model-category">{model.category}</p>
      <p className="model-description">{model.description}</p>
      <div className="model-meta">
        <span><Download size={14} /> {model.uses} uses</span>
        {model.status === 'published' && <span><Star size={14} /> {model.rating} ({model.reviewCount} reviews)</span>}
        <span><Clock size={14} /> {formatDate(model.createdAt)}</span>
      </div>
      <div className="model-price">{model.price > 0 ? `$${model.price}` : 'Free'}</div>
      <div className="model-actions">
        <Link to={`/edit-model/${model.id}`}><Button variant="outline" className="btn-sm"><Edit size={14} /> Edit</Button></Link>
        <Button variant="danger" className="btn-sm" onClick={() => handleDeleteModel(model.id)}><Trash2 size={14} /> Delete</Button>
        {model.status === 'draft' && <Button variant="gradient" className="btn-sm"><Share2 size={14} /> Publish</Button>}
      </div>
    </div>
  </div>
);

const AnalyticsTab = ({ userPerformance, usageData, revenueData }) => (
  <div className="analytics-tab animated-tab">
    <h2 className="tab-title">Performance Analytics</h2>
    <div className="analytics-grid">
      <div className="analytics-card glass-effect animated-card">
        <h3>Total Uses</h3>
        <div className="value">{userPerformance.totalUses}</div>
        <div className="trend positive"><TrendingUp size={14} /> +12.5%</div>
      </div>
      <div className="analytics-card glass-effect animated-card">
        <h3>Revenue</h3>
        <div className="value">${userPerformance.totalEarnings}</div>
        <div className="trend positive"><TrendingUp size={14} /> +8.3%</div>
      </div>
      <div className="analytics-card glass-effect animated-card">
        <h3>Average Rating</h3>
        <div className="value">4.8/5</div>
        <div className="trend neutral">Stable</div>
      </div>
      <div className="analytics-card glass-effect animated-card">
        <h3>Tokens Earned</h3>
        <div className="value">{userPerformance.tokensEarned}</div>
        <div className="trend positive"><TrendingUp size={14} /> +15%</div>
      </div>
    </div>
    <div className="charts-container">
      <div className="chart-card glass-effect animated-card">
        <h3>Usage Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={usageData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #ff6b6b', borderRadius: '10px', color: '#fff' }} />
            <Line type="monotone" dataKey="uses" stroke="#ff6b6b" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card glass-effect animated-card">
        <h3>Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={revenueData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #82ca9d', borderRadius: '10px', color: '#fff' }} formatter={(value) => [`$${value}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ContributionsTab = ({ profileData, contributionData }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthPositions = [
    { month: 'Jan', week: 0 }, { month: 'Feb', week: 4 }, { month: 'Mar', week: 9 },
    { month: 'Apr', week: 13 }, { month: 'May', week: 17 }, { month: 'Jun', week: 22 },
    { month: 'Jul', week: 26 }, { month: 'Aug', week: 30 }, { month: 'Sep', week: 35 },
    { month: 'Oct', week: 39 }, { month: 'Nov', week: 44 }, { month: 'Dec', week: 48 },
  ];

  return (
    <div className="contributions-tab animated-tab">
      <h2 className="tab-title">Contribution Quest</h2>
      <div className="contribution-stats">
        <div className="stat-item tooltip" data-tooltip={`Current Streak: ${profileData.streak} days`}>
          <Zap size={20} /> Current Streak: <span style={{ color: '#ff6b6b' }}>{profileData.streak} days</span>
        </div>
        <div className="stat-item tooltip" data-tooltip={`Total Contributions: ${profileData.contributions}`}>
          <FileText size={20} /> Total Contributions: {profileData.contributions}
        </div>
        <div className="stat-item tooltip" data-tooltip="Tokens Earned: 225">
          <DollarSign size={20} /> Tokens Earned: 225
        </div>
      </div>
      <div className="contribution-heatmap glass-effect animated-card">
        <h3 className="heatmap-header">{profileData.contributions} contributions in the last year</h3>
        <div className="heatmap-wrapper">
          <div className="heatmap-months">
            {monthPositions.map((pos, index) => (
              <span key={index} className="month-label">{pos.month}</span>
            ))}
          </div>
          <div className="heatmap-container">
            <div className="heatmap-days">
              {days.map((day, index) => (
                <div key={index} className="day-label">{day}</div>
              ))}
            </div>
            <div className="heatmap-grid">
              {Array.from({ length: 53 * 7 }, (_, i) => {
                const date = new Date(2024, 3, 9 + (Math.floor(i / 7) * 7) + (i % 7));
                const contribution = contributionData.find(d => d.date === date.toISOString().split('T')[0]) || { count: 0 };
                const colorClass = contribution.count === 0 ? 'zero' : contribution.count === 1 ? 'one' : contribution.count === 2 ? 'two' : contribution.count === 3 ? 'three' : 'four';
                return (
                  <div
                    key={i}
                    className={`heatmap-square ${colorClass} tooltip`}
                    data-tooltip={`${contribution.count} contribution(s) on ${formatDate(date.toISOString())}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="heatmap-footer">
          <a href="#" className="learn-more">Learn how we count contributions</a>
          <div className="legend">
            <span className="legend-item zero">No contributions</span>
            <span className="legend-item one">1</span>
            <span className="legend-item two">2</span>
            <span className="legend-item three">3</span>
            <span className="legend-item four">4+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaderboardTab = () => {
  const leaderboardData = [
    { rank: 1, username: 'QuantumCreator', points: 5000 },
    { rank: 2, username: 'NeuralNinja', points: 4500 },
    { rank: 3, username: 'AIChain_Creator', points: 4000 },
    { rank: 4, username: 'DataDynamo', points: 3500 },
    { rank: 5, username: 'ModelMaster', points: 3000 },
  ];

  return (
    <div className="leaderboard-tab animated-tab">
      <h2 className="tab-title">Creator Leaderboard</h2>
      <div className="leaderboard-container glass-effect animated-card">
        {leaderboardData.map((user, index) => (
          <div key={index} className={`leaderboard-item ${user.username === 'AIChain_Creator' ? 'current-user' : ''}`}>
            <span className="rank">#{user.rank}</span>
            <span className="avatar"><User size={20} /></span>
            <span className="username">{user.username}</span>
            <span className="points">{user.points} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myModels');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'AIChain_Creator',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    bio: 'AI model creator specializing in text generation and image recognition models.',
    level: 3,
    points: 1250,
    tokens: 750,
    streak: 15,
    contributions: 241,
  });

  const [contributionData] = useState(() => {
    const data = [];
    const startDate = new Date(2024, 3, 9);
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(2025, 3, 8)) {
      data.push({ date: currentDate.toISOString().split('T')[0], count: Math.floor(Math.random() * 5) });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  });

  const [myModels, setMyModels] = useState([
    { id: 1, name: 'NeuralText Pro', category: 'Text Generation', description: 'Advanced language model for creative writing.', price: 299, status: 'published', uses: 1324, rating: 4.8, reviewCount: 256, image: image8, isNFT: true, createdAt: '2025-03-15' },
    { id: 2, name: 'VisionAI Studio', category: 'Image Recognition', description: 'State-of-the-art computer vision model.', price: 0, status: 'draft', uses: 0, rating: 0, reviewCount: 0, image: image9, isNFT: false, createdAt: '2025-04-01' },
  ]);

  const [savedModels] = useState([
    { id: 3, name: 'SynthWave Audio', creator: 'AudioLabs', category: 'Audio Processing', description: 'Audio generation system.', price: 199, rating: 4.3, reviewCount: 127, image: image13, savedAt: '2025-04-02' },
    { id: 4, name: 'DataMiner Pro', creator: 'AnalyticsAI', category: 'Data Analysis', description: 'Advanced data analytics model.', price: 399, rating: 4.5, reviewCount: 164, image: image4, savedAt: '2025-03-28' },
  ]);

  const [recentActivity] = useState([
    { id: 1, type: 'test', modelName: 'NeuralText Pro', timestamp: '2025-04-07T10:23:45', result: 'Generated story about space exploration', modelId: 1 },
    { id: 2, type: 'favorite', modelName: 'SynthWave Audio', timestamp: '2025-04-06T14:15:00', modelId: 3 },
    { id: 3, type: 'contribution', modelName: 'VisionAI Studio', timestamp: '2025-04-05T09:30:22', result: 'Uploaded new model', modelId: 2 },
  ]);

  const [userPerformance] = useState({
    totalEarnings: 1289,
    totalUses: 1324,
    rank: 15,
    achievements: ['Top Creator - March 2025', '1000 Uses Milestone', '10-Day Streak'],
    tokensEarned: 250,
  });

  const usageData = useMemo(() => [
    { name: 'Mar 1', uses: 145 }, { name: 'Mar 8', uses: 231 }, { name: 'Mar 15', uses: 278 },
    { name: 'Mar 22', uses: 334 }, { name: 'Mar 29', uses: 390 }, { name: 'Apr 5', uses: 421 },
  ], []);

  const revenueData = useMemo(() => [
    { name: 'Mar 1', revenue: 425 }, { name: 'Mar 8', revenue: 698 }, { name: 'Mar 15', revenue: 830 },
    { name: 'Mar 22', revenue: 992 }, { name: 'Mar 29', revenue: 1156 }, { name: 'Apr 5', revenue: 1289 },
  ], []);

  const achievementDistribution = useMemo(() => [
    { name: 'Usage Milestones', value: 40 }, { name: 'Creator Awards', value: 30 }, { name: 'Streak Achievements', value: 30 },
  ], []);

  const tokenUsageBreakdown = useMemo(() => [
    { name: 'Model Upgrades', value: 150 }, { name: 'Marketplace Purchases', value: 100 },
  ], []);

  const COLORS = ['#ff6b6b', '#82ca9d', '#a16eff', '#ffd700'];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/save/wallet/${profileData.walletAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profileData.username, bio: profileData.bio }),
      });
      const data = await res.json();
      setProfileData(data.user);
      setIsEditingProfile(false);
      console.log('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteModel = (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      setMyModels(myModels.filter(model => model.id !== modelId));
    }
  };

  useEffect(() => {
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar />
      <main className="dashboard-main">
        <header className="dashboard-header animated-header">
          <h1 className="welcome-title">Welcome, {profileData.username}!</h1>
          <p className="header-subtitle">Build, share, and earn with your AI models!</p>
          <Button variant="gradient" className="cta-button">
            <Rocket size={20} /> Start a New Quest
          </Button>
        </header>
        <div className="dashboard-content">
          <section className="sidebar">
            <ProfileCard
              profileData={profileData}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              setProfileData={setProfileData}
              handleProfileUpdate={handleProfileUpdate}
            />
            <PerformanceCard userPerformance={userPerformance} />
            <QuestProgress profileData={profileData} />
          </section>
          <section className="main-content">
            <div className="tabs-container">
              {['myModels', 'analytics', 'saved', 'activity', 'performance', 'contributions', 'leaderboard'].map(tab => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'myModels' && <FileText size={18} />}
                  {tab === 'analytics' && <BarChart2 size={18} />}
                  {tab === 'saved' && <Star size={18} />}
                  {tab === 'activity' && <Clock size={18} />}
                  {tab === 'performance' && <Trophy size={18} />}
                  {tab === 'contributions' && <GitCommit size={18} />}
                  {tab === 'leaderboard' && <Users size={18} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
            <div className="tab-content glass-effect animated-tab-content">
              {activeTab === 'myModels' && (
                <div className="my-models-tab">
                  <div className="tab-header">
                    <h2 className="tab-title">My Models</h2>
                    <div className="tab-actions">
                      <div className="view-toggle">
                        <button
                          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid size={18} />
                        </button>
                        <button
                          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                          onClick={() => setViewMode('list')}
                        >
                          <List size={18} />
                        </button>
                      </div>
                      <Link to="/upload"><Button variant="gradient">+ New Model</Button></Link>
                    </div>
                  </div>
                  <div className={`models-container ${viewMode}`}>
                    {myModels.length > 0 ? myModels.map(model => (
                      <ModelCard key={model.id} model={model} viewMode={viewMode} handleDeleteModel={handleDeleteModel} />
                    )) : (
                      <div className="empty-state">
                        <p>No models created yet. Start your creator journey!</p>
                        <Link to="/upload"><Button variant="gradient">Create Now</Button></Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'analytics' && <AnalyticsTab userPerformance={userPerformance} usageData={usageData} revenueData={revenueData} />}
              {activeTab === 'saved' && (
                <div className="saved-models-tab">
                  <h2 className="tab-title">Saved Models</h2>
                  <div className={`models-container ${viewMode}`}>
                    {savedModels.length > 0 ? savedModels.map(model => (
                      <div key={model.id} className="model-card glass-effect animated-card">
                        <div className="model-image">
                          <img src={model.image} alt={model.name} />
                        </div>
                        <div className="model-details">
                          <h3 className="model-title">{model.name}</h3>
                          <p className="model-creator">by {model.creator}</p>
                          <p className="model-category">{model.category}</p>
                          <div className="model-meta">
                            <Star size={14} /> {model.rating} ({model.reviewCount} reviews)
                          </div>
                          <div className="model-price">{model.price > 0 ? `$${model.price}` : 'Free'}</div>
                          <div className="model-actions">
                            <Link to={`/marketplace/${model.id}`}>
                              <Button variant="gradient" className="btn-sm">View</Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="btn-sm"
                              onClick={() => setSavedModels(savedModels.filter(m => m.id !== model.id))}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state">
                        <p>No saved models. Explore the marketplace!</p>
                        <Link to="/marketplace"><Button variant="gradient">Explore Now</Button></Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'activity' && (
                <div className="activity-tab">
                  <h2 className="tab-title">Recent Activity</h2>
                  <div className="activity-timeline">
                    {recentActivity.length > 0 ? recentActivity.map(activity => (
                      <div key={activity.id} className="activity-item glass-effect animated-card">
                        <div className="activity-icon">
                          {activity.type === 'test' ? <Activity size={20} /> : activity.type === 'contribution' ? <GitCommit size={20} /> : <Star size={20} />}
                        </div>
                        <div className="activity-content">
                          <h3>
                            {activity.type === 'test' ? `Tested ${activity.modelName}` : activity.type === 'contribution' ? `Contributed ${activity.modelName}` : `Saved ${activity.modelName}`}
                          </h3>
                          <p>{activity.result || ''}</p>
                          <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                          {activity.modelId ? (
                            <Link to={`/marketplace/${activity.modelId}`}>
                              <Button variant="gradient" className="btn-sm">View</Button>
                            </Link>
                          ) : (
                            <Button variant="outline" className="btn-sm" disabled>View Unavailable</Button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state">
                        <p>No recent activity. Start exploring!</p>
                        <Link to="/marketplace"><Button variant="gradient">Get Started</Button></Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'performance' && (
                <div className="performance-tab">
                  <h2 className="tab-title animated-title">Performance Overview</h2>
                  <div className="performance-overview">
                    <div className="performance-card glass-effect animated-card">
                      <h3>Earnings History</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueData}>
                          <CartesianGrid stroke="#444" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #82ca9d', borderRadius: '10px', color: '#fff' }} formatter={(value) => [`$${value}`, 'Earnings']} />
                          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="performance-card glass-effect animated-card">
                      <h3>Usage History</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={usageData}>
                          <CartesianGrid stroke="#444" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #ff6b6b', borderRadius: '10px', color: '#fff' }} />
                          <Line type="monotone" dataKey="uses" stroke="#ff6b6b" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="performance-card glass-effect animated-card">
                      <h3>Achievement Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={achievementDistribution}>
                          <CartesianGrid stroke="#444" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #ffd700', borderRadius: '10px', color: '#fff' }} formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Bar dataKey="value" fill="#ffd700" barSize={30} radius={[10, 10, 0, 0]}>
                            {achievementDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="performance-card glass-effect animated-card">
                      <h3>Token Usage Breakdown</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={tokenUsageBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {tokenUsageBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid #ff6b6b', borderRadius: '10px', color: '#fff' }} formatter={(value) => [`${value} Tokens`, 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="performance-card glass-effect animated-card">
                      <h3>Rank Progress</h3>
                      <div className="rank-progress">
                        <p>Current Rank: #{userPerformance.rank}</p>
                        <div className="progress-bar">
                          <div
                            className="progress animated-progress"
                            style={{ width: `${(15 / 100) * 100}%` }}
                          />
                        </div>
                        <p>Next Rank at 10</p>
                      </div>
                    </div>
                    <div className="performance-card glass-effect animated-card">
                      <h3>Token Earnings</h3>
                      <div className="value animated-number">{userPerformance.tokensEarned}</div>
                      <p>Earn more by contributing models and engaging with the community!</p>
                      <Button variant="gradient" className="cta-button">Claim Rewards</Button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'contributions' && <ContributionsTab profileData={profileData} contributionData={contributionData} />}
              {activeTab === 'leaderboard' && <LeaderboardTab />}
            </div>
          </section>
        </div>
      </main>
      <ChatbotButton onClick={() => alert('Open chatbot modal here!')} />
    </div>
  );
};


export default Dashboard;

 const contractAddress = "0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19";
  const abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "modelId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "uploader",
          "type": "address"
        }
      ],
      "name": "ModelUploaded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_tags",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "_isPublic",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "uploadModel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllModels",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "tags",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "category",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isPublic",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "uploader",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct AIModelRegistry.Model[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "models",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "tags",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isPublic",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "uploader",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];