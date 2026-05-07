import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Contacts from './Contacts';
import Deals from './Deals';
import Tasks from './Tasks';
import Activities from './Activities';
import Profile from './Profile';
import Team from './Team';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({ 
    totalContacts: 0, 
    totalDeals: 0, 
    wonDeals: 0, 
    openDeals: 0,
    totalRevenue: 0 
  });
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Close sidebar when tab changes on mobile
  const handleTabChange = (item) => {
    setActiveTab(item);
    setSidebarOpen(false);
  };

  // Fetch real backend data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab === 'Overview') {
        setLoading(true);
        try {
          const statsRes = await api.get('/dashboard/stats');
          if (statsRes.data?.data) {
            setStats(statsRes.data.data);
          }
          
          const pipelineRes = await api.get('/dashboard/pipeline');
          if (pipelineRes.data?.data?.pipeline) {
            setPipeline(pipelineRes.data.data.pipeline);
          }
        } catch (err) {
          console.error("Error loading dashboard metrics", err);
        }
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeTab]);

  const navItems = ['Overview', 'Contacts', 'Deals', 'Tasks', 'Activities'];
  if (user?.role === 'owner' || user?.role === 'admin') {
    navItems.push('Team');
  }
  navItems.push('Settings');

  return (
    <div className="app-container">
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand" style={{ gap: '12px' }}>
          <div className="brand-icon" style={{ background: 'transparent', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>CRM</span>
        </div>
        
        <ul className="nav-links" style={{ flex: 1 }}>
          {navItems.map(item => (
            <li 
              key={item} 
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => handleTabChange(item)}
            >
              {item}
            </li>
          ))}
        </ul>

        {/* User Profile / Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || 'Member'}</div>
                </div>
            </div>
            <button onClick={logout} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Sign out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            {/* Hamburger – only visible on mobile via CSS */}
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div>
              <h1>
                {activeTab === 'Overview' 
                  ? (user?.role === 'sales_rep' ? 'My Sales Dashboard' : 'Company Overview') 
                  : activeTab}
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
        </header>

        {activeTab === 'Overview' ? (
            loading ? <p>Loading real-time data...</p> : (
            <>
              <div className="stats-grid">
                  <div className="stat-card">
                      <div className="stat-title">Total Contacts</div>
                      <div className="stat-value">{stats.totalContacts}</div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-title">Active Deals</div>
                      <div className="stat-value">{stats.totalDeals}</div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-title">Won Deals</div>
                      <div className="stat-value" style={{ color: 'var(--secondary)' }}>{stats.wonDeals}</div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-title">Total Revenue</div>
                      <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
                  </div>
              </div>
              
              <div className="stat-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Pipeline Breakdown</h3>
                {pipeline.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pipeline data available.</p> : (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {pipeline.map(stage => (
                      <div key={stage._id} style={{ background: 'var(--bg-dark)', padding: '1rem 1.5rem', borderRadius: '8px', minWidth: '130px', flex: '1 1 130px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{stage._id} Phase</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stage.count}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>${stage.totalValue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
            )
        ) : activeTab === 'Contacts' ? (
            <Contacts />
        ) : activeTab === 'Deals' ? (
            <Deals />
        ) : activeTab === 'Tasks' ? (
            <Tasks />
        ) : activeTab === 'Activities' ? (
            <Activities />
        ) : activeTab === 'Team' ? (
            <Team />
        ) : activeTab === 'Settings' ? (
            <Profile />
        ) : (
            <div className="stat-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{activeTab} Module</h2>
                <p style={{ color: 'var(--border)', marginTop: '1rem' }}>We are building out the {activeTab} connection next!</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
