import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Star } from 'lucide-react';
import { Clock } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { BarChart2 } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { Settings } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { Lock } from 'lucide-react';
import { Unlock } from 'lucide-react';
import { Grid } from 'lucide-react';
import { List } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { Activity } from 'lucide-react';
import { GitCommit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myModels');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'AIChain_Creator',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    bio: 'AI model creator specializing in text generation and image recognition models.',
    email: 'creator@aichain.io',
    twitter: '@aichain_creator',
    website: 'https://aichain.io/creator',
    level: 3,
    points: 1250,
    tokens: 750,
    streak: 15,
    contributions: 241,
  });

  // Demo data for contributions heatmap (simulated for a year)
  const contributionData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(2024, 0, 1); // Start from Jan 1, 2024
    date.setDate(date.getDate() + i);
    const contributions = Math.floor(Math.random() * 5); // Random contributions (0-4)
    return { date: date.toISOString().split('T')[0], count: contributions };
  });

  // Demo data
  const [myModels, setMyModels] = useState([
    { id: 1, name: "NeuralText Pro", category: "Text Generation", description: "Advanced language model for creative writing.", price: 299, status: "published", uses: 1324, rating: 4.8, reviewCount: 256, image: "https://via.placeholder.com/300x200", isNFT: true, blockchain: "Ethereum", createdAt: "2025-03-15" },
    { id: 2, name: "VisionAI Studio", category: "Image Recognition", description: "State-of-the-art computer vision model.", price: 0, status: "draft", uses: 0, rating: 0, reviewCount: 0, image: "https://via.placeholder.com/300x200", isNFT: false, createdAt: "2025-04-01" },
  ]);

  const [savedModels, setSavedModels] = useState([
    { id: 3, name: "SynthWave Audio", creator: "AudioLabs", category: "Audio Processing", description: "Audio generation system.", price: 199, rating: 4.3, reviewCount: 127, image: "https://via.placeholder.com/300x200", savedAt: "2025-04-02" },
    { id: 4, name: "DataMiner Pro", creator: "AnalyticsAI", category: "Data Analysis", description: "Advanced data analytics model.", price: 399, rating: 4.5, reviewCount: 164, image: "https://via.placeholder.com/300x200", savedAt: "2025-03-28" },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "test", modelName: "NeuralText Pro", timestamp: "2025-04-07T10:23:45", result: "Generated story about space exploration", modelId: 1 },
    { id: 2, type: "favorite", modelName: "SynthWave Audio", timestamp: "2025-04-06T14:15:00", modelId: 3 },
    { id: 3, type: "contribution", modelName: "VisionAI Studio", timestamp: "2025-04-05T09:30:22", result: "Uploaded new model", modelId: 2 },
  ]);

  const [userPerformance, setUserPerformance] = useState({
    totalEarnings: 1289,
    totalUses: 1324,
    rank: 15,
    achievements: ["Top Creator - March 2025", "1000 Uses Milestone", "10-Day Streak"],
    tokensEarned: 250,
  });

  const usageData = [
    { name: 'Mar 1', uses: 145 },
    { name: 'Mar 8', uses: 231 },
    { name: 'Mar 15', uses: 278 },
    { name: 'Mar 22', uses: 334 },
    { name: 'Mar 29', uses: 390 },
    { name: 'Apr 5', uses: 421 },
  ];

  const revenueData = [
    { name: 'Mar 1', revenue: 425 },
    { name: 'Mar 8', revenue: 698 },
    { name: 'Mar 15', revenue: 830 },
    { name: 'Mar 22', revenue: 992 },
    { name: 'Mar 29', revenue: 1156 },
    { name: 'Apr 5', revenue: 1289 },
  ];

  const recommendations = [
    { id: 5, name: "VoiceClone AI", creator: "SpeechTech", category: "Audio Processing", description: "Create a digital voice replica.", price: 249, rating: 4.7, reviewCount: 98, image: "https://via.placeholder.com/300x200", reason: "Based on your interest in SynthWave Audio" },
    { id: 6, name: "PredictiveAnalytics", creator: "DataScience", category: "Data Analysis", description: "Next-gen forecasting algorithms.", price: 349, rating: 4.6, reviewCount: 112, image: "https://via.placeholder.com/300x200", reason: "Popular in Data Analysis" },
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  const handleDeleteModel = (modelId) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      setMyModels(myModels.filter(model => model.id !== modelId));
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();
  const formatWalletAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // Get month and day names for heatmap
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="dashboard-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, {profileData.username}!</h1>
          <p className="header-subtitle">Manage your AI models and track your success on AIChain</p>
        </header>

        <div className="dashboard-grid">
          {/* Profile & Performance Section */}
          <section className="profile-performance-section glass-effect">
            <div className="profile-card">
              <div className="avatar-container">
                <div className="avatar">
                  <User size={50} />
                </div>
              </div>
              <div className="profile-info">
                <h2>{profileData.username} <span className="level-badge">Level {profileData.level}</span></h2>
                <p className="wallet-address">{formatWalletAddress(profileData.walletAddress)}</p>
                <p className="bio">{profileData.bio}</p>
                <div className="profile-stats">
                  <span><DollarSign size={16} /> Tokens: {profileData.tokens}</span>
                  <span style={{ color: '#6b48ff' }}><GitCommit size={16} /> Streak: {profileData.streak} days</span>
                  <span><FileText size={16} /> Contributions: {profileData.contributions}</span>
                </div>
                <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="edit-profile-btn">
                  <Edit size={16} /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              {isEditingProfile && (
                <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                  <div className="form-actions">
                    <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
                </form>
              )}
            </div>

            <div className="performance-card glass-effect">
              <h3><Trophy size={20} /> User Performance</h3>
              <div className="performance-stats">
                <div className="stat-item">
                  <DollarSign size={20} /> <span>Earnings: ${userPerformance.totalEarnings}</span>
                </div>
                <div className="stat-item">
                  <Download size={20} /> <span>Total Uses: {userPerformance.totalUses}</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={20} /> <span>Rank: #{userPerformance.rank}</span>
                </div>
                <div className="stat-item">
                  <DollarSign size={20} /> <span>Tokens Earned: {userPerformance.tokensEarned}</span>
                </div>
              </div>
              <div className="achievements">
                <h4>Achievements</h4>
                <ul>
                  {userPerformance.achievements.map((ach, index) => (
                    <li key={index}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Tabs Navigation */}
          <div className="dashboard-tabs">
            {['myModels', 'analytics', 'saved', 'activity', 'recommendations', 'performance', 'contributions'].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'myModels' && <FileText size={18} />} {tab === 'analytics' && <BarChart2 size={18} />}
                {tab === 'saved' && <Star size={18} />} {tab === 'activity' && <Clock size={18} />}
                {tab === 'recommendations' && <TrendingUp size={18} />} {tab === 'performance' && <Trophy size={18} />}
                {tab === 'contributions' && <GitCommit size={18} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content glass-effect">
            {activeTab === 'myModels' && (
              <div className="my-models-tab">
                <div className="tab-header">
                  <h2>My Models</h2>
                  <div className="tab-actions">
                    <div className="view-toggle">
                      <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                        <Grid size={18} />
                      </button>
                      <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                        <List size={18} />
                      </button>
                    </div>
                    <Link to="/upload">
                      <Button variant="primary">+ New Model</Button>
                    </Link>
                  </div>
                </div>
                <div className={`models-container ${viewMode}`}>
                  {myModels.length > 0 ? myModels.map(model => (
                    <div key={model.id} className="model-card glass-effect">
                      <div className="model-image">
                        <img src={model.image} alt={model.name} />
                        <div className="model-badge">
                          <span className={`status ${model.status}`}>
                            {model.status === 'published' ? <Unlock size={14} /> : <Lock size={14} />}
                            {model.status}
                          </span>
                          {model.isNFT && <span className="badge nft">NFT</span>}
                        </div>
                      </div>
                      <div className="model-details">
                        <h3>{model.name}</h3>
                        <p className="model-category">{model.category}</p>
                        <p className="model-description">{model.description}</p>
                        <div className="model-meta">
                          <span><Download size={14} /> {model.uses} uses</span>
                          {model.status === 'published' && <span><Star size={14} /> {model.rating} ({model.reviewCount} reviews)</span>}
                          <span><Clock size={14} /> {formatDate(model.createdAt)}</span>
                        </div>
                        <div className="model-price">{model.price > 0 ? `$${model.price}` : 'Free'}</div>
                        <div className="model-actions">
                          <Link to={`/edit-model/${model.id}`}>
                            <Button variant="outline" className="btn-sm"><Edit size={14} /> Edit</Button>
                          </Link>
                          <Button variant="danger" className="btn-sm" onClick={() => handleDeleteModel(model.id)}><Trash2 size={14} /> Delete</Button>
                          {model.status === 'draft' && <Button variant="secondary" className="btn-sm"><Share2 size={14} /> Publish</Button>}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <p>No models created yet.</p>
                      <Link to="/upload"><Button variant="primary">Create Now</Button></Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-tab">
                <h2>Performance Analytics</h2>
                <div className="analytics-grid">
                  <div className="analytics-card glass-effect">
                    <h3>Total Uses</h3>
                    <div className="value">{userPerformance.totalUses}</div>
                    <div className="trend positive"><TrendingUp size={14} /> +12.5%</div>
                  </div>
                  <div className="analytics-card glass-effect">
                    <h3>Revenue</h3>
                    <div className="value">${userPerformance.totalEarnings}</div>
                    <div className="trend positive"><TrendingUp size={14} /> +8.3%</div>
                  </div>
                  <div className="analytics-card glass-effect">
                    <h3>Average Rating</h3>
                    <div className="value">4.8/5</div>
                    <div className="trend neutral">Stable</div>
                  </div>
                  <div className="analytics-card glass-effect">
                    <h3>Tokens Earned</h3>
                    <div className="value">{userPerformance.tokensEarned}</div>
                    <div className="trend positive"><TrendingUp size={14} /> +15%</div>
                  </div>
                </div>
                <div className="charts-container">
                  <div className="chart-card glass-effect">
                    <h3>Usage Trends</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={usageData}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />
                        <Line type="monotone" dataKey="uses" stroke="#6b48ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card glass-effect">
                    <h3>Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={revenueData}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="saved-models-tab">
                <h2>Saved Models</h2>
                <div className={`models-container ${viewMode}`}>
                  {savedModels.length > 0 ? savedModels.map(model => (
                    <div key={model.id} className="model-card glass-effect">
                      <div className="model-image"><img src={model.image} alt={model.name} /></div>
                      <div className="model-details">
                        <h3>{model.name}</h3>
                        <p className="model-creator">by {model.creator}</p>
                        <p className="model-category">{model.category}</p>
                        <div className="model-meta"><Star size={14} /> {model.rating} ({model.reviewCount} reviews)</div>
                        <div className="model-price">{model.price > 0 ? `$${model.price}` : 'Free'}</div>
                        <div className="model-actions">
                          <Link to={`/marketplace/${model.id}`}><Button variant="primary" className="btn-sm">View</Button></Link>
                          <Button variant="outline" className="btn-sm" onClick={() => setSavedModels(savedModels.filter(m => m.id !== model.id))}>Remove</Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <p>No saved models.</p>
                      <Link to="/marketplace"><Button variant="primary">Explore Now</Button></Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-tab">
                <h2>Recent Activity</h2>
                <div className="activity-timeline">
                  {recentActivity.length > 0 ? recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item glass-effect">
                      <div className="activity-icon">{activity.type === 'test' ? <Activity size={20} /> : activity.type === 'contribution' ? <GitCommit size={20} /> : <Star size={20} />}</div>
                      <div className="activity-content">
                        <h3>{activity.type === 'test' ? `Tested ${activity.modelName}` : activity.type === 'contribution' ? `Contributed ${activity.modelName}` : `Saved ${activity.modelName}`}</h3>
                        <p>{activity.result || ''}</p>
                        <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                        <Link to={`/marketplace/${activity.modelId}`}><Button variant="outline" className="btn-sm">View</Button></Link>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <p>No recent activity.</p>
                      <Link to="/marketplace"><Button variant="primary">Get Started</Button></Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="recommendations-tab">
                <h2>Recommended Models</h2>
                <div className={`models-container ${viewMode}`}>
                  {recommendations.map(model => (
                    <div key={model.id} className="model-card glass-effect">
                      <div className="model-image">
                        <img src={model.image} alt={model.name} />
                        <span className="recommendation-badge">Recommended</span>
                      </div>
                      <div className="model-details">
                        <h3>{model.name}</h3>
                        <p className="model-creator">by {model.creator}</p>
                        <p className="model-category">{model.category}</p>
                        <div className="model-meta"><Star size={14} /> {model.rating} ({model.reviewCount} reviews)</div>
                        <p className="recommendation-reason">{model.reason}</p>
                        <div className="model-price">{model.price > 0 ? `$${model.price}` : 'Free'}</div>
                        <div className="model-actions">
                          <Link to={`/marketplace/${model.id}`}><Button variant="primary" className="btn-sm">View</Button></Link>
                          <Button variant="outline" className="btn-sm" onClick={() => setSavedModels([...savedModels, { ...model, savedAt: new Date().toISOString() }])}><Star size={14} /> Save</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="performance-tab">
                <h2>Performance Overview</h2>
                <div className="performance-grid">
                  <div className="performance-card glass-effect">
                    <h3>Earnings History</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={revenueData}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="performance-card glass-effect">
                    <h3>Usage History</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={usageData}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />
                        <Line type="monotone" dataKey="uses" stroke="#6b48ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="performance-card glass-effect">
                    <h3>Rank Progress</h3>
                    <div className="rank-progress">
                      <p>Current Rank: #{userPerformance.rank}</p>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${(15 / 100) * 100}%` }}></div>
                      </div>
                      <p>Next Rank at 10</p>
                    </div>
                  </div>
                  <div className="performance-card glass-effect">
                    <h3>Token Earnings</h3>
                    <div className="value">{userPerformance.tokensEarned}</div>
                    <p>Earn more by contributing models and engaging with the community!</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contributions' && (
              <div className="contributions-tab">
                <h2>Contribution Overview</h2>
                <div className="contribution-stats">
                  <div className="stat-item"><GitCommit size={18} /> Current Streak: <span style={{ color: '#6b48ff' }}>15 days</span></div>
                  <div className="stat-item"><FileText size={18} /> Total Contributions: 241</div>
                  <div className="stat-item"><DollarSign size={18} /> Tokens from Contributions: 225</div>
                </div>
                <div className="contribution-heatmap glass-effect">
                  <div className="heatmap-header">
                    <span>{profileData.contributions} contributions in the last year</span>
                  </div>
                  <div className="heatmap-container">
                    <div className="heatmap-days">
                      {days.slice(0, 7).map((day, index) => (
                        <span key={index} className="day-label">{day.slice(0, 1)}</span>
                      ))}
                    </div>
                    <div className="heatmap-grid">
                      {contributionData.map((day, index) => {
                        const contributionCount = day.count;
                        let colorClass = 'zero';
                        if (contributionCount === 1) colorClass = 'one';
                        else if (contributionCount === 2) colorClass = 'two';
                        else if (contributionCount === 3) colorClass = 'three';
                        else if (contributionCount >= 4) colorClass = 'four';
                        return (
                          <div
                            key={index}
                            className={`heatmap-square ${colorClass}`}
                            title={`${day.count} contribution(s) on ${new Date(day.date).toLocaleDateString()}`}
                          />
                        );
                      })}
                    </div>
                    <div className="heatmap-months">
                      {months.map((month, index) => (
                        <span key={index} className="month-label" style={{ left: `${(index * (100 / 12))}%` }}>{month}</span>
                      ))}
                    </div>
                  </div>
                  <div className="heatmap-footer">
                    <span className="learn-more">Learn how we count contributions</span>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;