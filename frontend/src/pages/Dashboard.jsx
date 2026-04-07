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
  
  const [stats, setStats] = useState({ 
    totalContacts: 0, 
    totalDeals: 0, 
    wonDeals: 0, 
    openDeals: 0,
    totalRevenue: 0 
  });
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">★</div>
          CRM SaaS
        </div>
        
        <ul className="nav-links" style={{ flex: 1 }}>
          {navItems.map(item => (
            <li 
              key={item} 
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </li>
          ))}
        </ul>

        {/* User Profile / Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
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
          <div>
            <h1>
              {activeTab === 'Overview' 
                ? (user?.role === 'sales_rep' ? 'My Sales Dashboard' : 'Company Overview') 
                : activeTab}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Welcome back to your workspace, {user?.name}</p>
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
                      <div key={stage._id} style={{ background: 'var(--bg-dark)', padding: '1rem 1.5rem', borderRadius: '8px', minWidth: '150px' }}>
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
