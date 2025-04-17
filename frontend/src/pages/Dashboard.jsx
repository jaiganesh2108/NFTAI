import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import image1 from '../assets/images/imgg1.jpg';
import image9 from '../assets/images/img9.jpg';
import image8 from '../assets/images/img8.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image13 from '../assets/images/img13.jpg';
import { 
  User, Edit, Trash2, Star, Clock, TrendingUp, BarChart2, DollarSign, 
  FileText, Download, Share2, Lock, Unlock, Grid, List, Trophy, Activity, GitCommit 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import '../styles/Dashboard.css';
import ChatbotButton from '../pages/ChatbotButton.jsx';

// Reusable Components
const ProfileCard = ({ profileData, isEditingProfile, setIsEditingProfile, setProfileData, handleProfileUpdate, formatWalletAddress }) => (
  <div className="profile-card glass-effect">
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
);
const PerformanceCard = ({ userPerformance }) => (
  <div className="performance-card glass-effect">
    <h3><Trophy size={20} /> User Performance</h3>
    <div className="performance-stats">
      <div className="stat-item"><DollarSign size={20} /> <span>Earnings: ${userPerformance.totalEarnings}</span></div>
      <div className="stat-item"><Download size={20} /> <span>Total Uses: {userPerformance.totalUses}</span></div>
      <div className="stat-item"><TrendingUp size={20} /> <span>Rank: #{userPerformance.rank}</span></div>
      <div className="stat-item"><DollarSign size={20} /> <span>Tokens Earned: {userPerformance.tokensEarned}</span></div>
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
);

const ModelCard = ({ model, viewMode, handleDeleteModel, formatDate }) => (
  <div className="model-card glass-effect">
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
        <Link to={`/edit-model/${model.id}`}><Button variant="outline" className="btn-sm"><Edit size={14} /> Edit</Button></Link>
        <Button variant="danger" className="btn-sm" onClick={() => handleDeleteModel(model.id)}><Trash2 size={14} /> Delete</Button>
        {model.status === 'draft' && <Button variant="secondary" className="btn-sm"><Share2 size={14} /> Publish</Button>}
      </div>
    </div>
  </div>
);

const AnalyticsTab = ({ userPerformance, usageData, revenueData }) => (
  <div className="analytics-tab">
    <h2>Performance Analytics</h2>
    <div className="analytics-grid">
      <div className="analytics-card glass-effect"><h3>Total Uses</h3><div className="value">{userPerformance.totalUses}</div><div className="trend positive"><TrendingUp size={14} /> +12.5%</div></div>
      <div className="analytics-card glass-effect"><h3>Revenue</h3><div className="value">${userPerformance.totalEarnings}</div><div className="trend positive"><TrendingUp size={14} /> +8.3%</div></div>
      <div className="analytics-card glass-effect"><h3>Average Rating</h3><div className="value">4.8/5</div><div className="trend neutral">Stable</div></div>
      <div className="analytics-card glass-effect"><h3>Tokens Earned</h3><div className="value">{userPerformance.tokensEarned}</div><div className="trend positive"><TrendingUp size={14} /> +15%</div></div>
    </div>
    <div className="charts-container">
      <div className="chart-card glass-effect">
        <h3>Usage Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={usageData}><CartesianGrid stroke="#444" /><XAxis dataKey="name" stroke="#aaa" /><YAxis stroke="#aaa" /><Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} /><Line type="monotone" dataKey="uses" stroke="#6b48ff" strokeWidth={2} dot={false} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card glass-effect">
        <h3>Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueData}><CartesianGrid stroke="#444" /><XAxis dataKey="name" stroke="#aaa" /><YAxis stroke="#aaa" /><Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value) => [`$${value}`, 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} dot={false} /></LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ContributionsTab = ({ profileData, contributionData, formatDate }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate month positions based on 53 weeks
  const monthPositions = [
    { month: 'Jan', week: 0 },
    { month: 'Feb', week: 4 },
    { month: 'Mar', week: 9 },
    { month: 'Apr', week: 13 },
    { month: 'May', week: 17 },
    { month: 'Jun', week: 22 },
    { month: 'Jul', week: 26 },
    { month: 'Aug', week: 30 },
    { month: 'Sep', week: 35 },
    { month: 'Oct', week: 39 },
    { month: 'Nov', week: 44 },
    { month: 'Dec', week: 48 },
  ];

  return (
    <div className="contributions-tab">
      <h2>Contribution Overview</h2>
      <div className="contribution-stats">
        <div className="stat-item"><GitCommit size={18} /> Current Streak: <span style={{ color: '#6b48ff' }}>15 days</span></div>
        <div className="stat-item"><FileText size={18} /> Total Contributions: {profileData.contributions}</div>
        <div className="stat-item"><DollarSign size={18} /> Tokens from Contributions: 225</div>
      </div>
      <div className="contribution-heatmap glass-effect">
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
                const date = new Date(2024, 3, 9 + (Math.floor(i / 7) * 7) + (i % 7)); // Starting from April 9, 2024
                const contribution = contributionData.find(d => d.date === date.toISOString().split('T')[0]) || { count: 0 };
                let colorClass = 'zero';
                if (contribution.count === 1) colorClass = 'one';
                else if (contribution.count === 2) colorClass = 'two';
                else if (contribution.count === 3) colorClass = 'three';
                else if (contribution.count >= 4) colorClass = 'four';
                return (
                  <div
                    key={i}
                    className={`heatmap-square ${colorClass}`}
                    title={`${contribution.count} contribution(s) on ${formatDate(date.toISOString())}`}
                  />
                );
              })}
            </div>
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
    email: 'creator@aichain.io',
    twitter: '@aichain_creator',
    website: 'https://aichain.io/creator',
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
      const contributions = Math.floor(Math.random() * 5);
      data.push({ date: currentDate.toISOString().split('T')[0], count: contributions });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  });

  const [myModels, setMyModels] = useState([
    { id: 1, name: "NeuralText Pro", category: "Text Generation", description: "Advanced language model for creative writing.", price: 299, status: "published", uses: 1324, rating: 4.8, reviewCount: 256, image: image8, isNFT: true, blockchain: "Ethereum", createdAt: "2025-03-15" },
    { id: 2, name: "VisionAI Studio", category: "Image Recognition", description: "State-of-the-art computer vision model.", price: 0, status: "draft", uses: 0, rating: 0, reviewCount: 0, image: image9, isNFT: false, createdAt: "2025-04-01" },
  ]);

  const [savedModels, setSavedModels] = useState([
    { id: 3, name: "SynthWave Audio", creator: "AudioLabs", category: "Audio Processing", description: "Audio generation system.", price: 199, rating: 4.3, reviewCount: 127, image: image13, savedAt: "2025-04-02" },
    { id: 4, name: "DataMiner Pro", creator: "AnalyticsAI", category: "Data Analysis", description: "Advanced data analytics model.", price: 399, rating: 4.5, reviewCount: 164, image: image4, savedAt: "2025-03-28" },
  ]);

  const [recentActivity] = useState([
    { id: 1, type: "test", modelName: "NeuralText Pro", timestamp: "2025-04-07T10:23:45", result: "Generated story about space exploration", modelId: 1 },
    { id: 2, type: "favorite", modelName: "SynthWave Audio", timestamp: "2025-04-06T14:15:00", modelId: 3 },
    { id: 3, type: "contribution", modelName: "VisionAI Studio", timestamp: "2025-04-05T09:30:22", result: "Uploaded new model", modelId: 2 },
  ]);

  const [userPerformance] = useState({
    totalEarnings: 1289,
    totalUses: 1324,
    rank: 15,
    achievements: ["Top Creator - March 2025", "1000 Uses Milestone", "10-Day Streak"],
    tokensEarned: 250,
    averageRating: 4.6,
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

  const COLORS = ['#6b48ff', '#82ca9d', '#a16eff', '#8a4af7'];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`http://localhost:5000/api/save/wallet/${profileData.walletAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileData.username,
          bio: profileData.bio
        })
      });
  
      const data = await res.json();
      setProfileData(data.user);
      setIsEditingProfile(false);
      console.log("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  

  const handleDeleteModel = (modelId) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      setMyModels(myModels.filter(model => model.id !== modelId));
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();
  const formatWalletAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <div className="dashboard-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, NooSphere Creator!</h1>
          <p className="header-subtitle">Manage your AI models and track your success on NooSphere</p>
        </header>

        <div className="dashboard-grid">
          <section className="profile-performance-section">
            <ProfileCard 
              profileData={profileData}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              setProfileData={setProfileData}
              handleProfileUpdate={handleProfileUpdate}
              formatWalletAddress={formatWalletAddress}
            />
            <PerformanceCard userPerformance={userPerformance} />
          </section>

          <div className="dashboard-tabs">
            {['myModels', 'analytics', 'saved', 'activity', 'performance', 'contributions'].map((tab) => (
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
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          <div className="tab-content glass-effect">
            {activeTab === 'myModels' && (
              <div className="my-models-tab">
                <div className="tab-header">
                  <h2>My Models</h2>
                  <div className="tab-actions">
                    <div className="view-toggle">
                      <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
                      <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /></button>
                    </div>
                    <Link to="/upload"><Button variant="primary">+ New Model</Button></Link>
                  </div>
                </div>
                <div className={`models-container ${viewMode}`}>
                  {myModels.length > 0 ? myModels.map(model => (
                    <ModelCard 
                      key={model.id}
                      model={model}
                      viewMode={viewMode}
                      handleDeleteModel={handleDeleteModel}
                      formatDate={formatDate}
                    />
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
              <AnalyticsTab userPerformance={userPerformance} usageData={usageData} revenueData={revenueData} />
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
                            <Button variant="outline" className="btn-sm">View</Button>
                          </Link>
                        ) : (
                          <Button variant="outline" className="btn-sm" disabled>View Unavailable</Button>
                        )}
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

            {activeTab === 'performance' && (
              <div className="performance-tab">
                <h2 className="animated-title">Performance Overview</h2>
                <div className="performance-overview">
                  <div className="performance-card glass-effect">
                    <h3>Earnings History</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#444" /><XAxis dataKey="name" stroke="#aaa" /><YAxis stroke="#aaa" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value) => [`$${value}`, 'Earnings']} />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="performance-card glass-effect">
                    <h3>Usage History</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={usageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#444" /><XAxis dataKey="name" stroke="#aaa" /><YAxis stroke="#aaa" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="uses" stroke="#6b48ff" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="performance-card glass-effect">
                    <h3>Achievement Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={achievementDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#444" /><XAxis dataKey="name" stroke="#aaa" /><YAxis stroke="#aaa" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Bar dataKey="value" fill="#a16eff" barSize={30} radius={[10, 10, 0, 0]}>
                          {achievementDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="performance-card glass-effect">
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
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', border: '1px solid #6b48ff', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value) => [`${value} Tokens`, 'Amount']} />
                      </PieChart>
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
                    <div className="value animated-number">{userPerformance.tokensEarned}</div>
                    <p>Earn more by contributing models and engaging with the community!</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contributions' && (
              <ContributionsTab profileData={profileData} contributionData={contributionData} formatDate={formatDate} />
            )}
          </div>
        </div>
      </main>
      <ChatbotButton onClick={() => alert('Open chatbot modal here!')} />
    </div>
  );
};

export default Dashboard;