import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const inputStyle = {
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'white',
  fontSize: '0.875rem',
  outline: 'none',
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ── ApiFeatures query state ──────────────────────────────
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort]         = useState('-createdAt');
  const [page, setPage]         = useState(1);
  const LIMIT = 10;

  // ── Modal state ──────────────────────────────────────────
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'pending', priority: 'medium', dueDate: '',
  });

  // ── Build query string → sent to ApiFeatures on the backend ──
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search)   { params.set('title[regex]', search); params.set('title[options]', 'i'); } // ApiFeatures.filter()
    if (status)   params.set('status', status);
    if (priority) params.set('priority', priority);
    params.set('sort', sort);                           // ApiFeatures.sort()
    params.set('page', page);                           // ApiFeatures.paginate()
    params.set('limit', LIMIT);
    return params.toString();
  }, [search, status, priority, sort, page]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?${buildQuery()}`);
      setTasks(res.data.data.tasks || res.data.data || []);
      setTotal(res.data.results ?? res.data.total ?? 0);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearchChange   = (e) => { setSearch(e.target.value);   setPage(1); };
  const handleStatusChange   = (e) => { setStatus(e.target.value);   setPage(1); };
  const handlePriorityChange = (e) => { setPriority(e.target.value); setPage(1); };
  const handleSortChange     = (e) => { setSort(e.target.value);     setPage(1); };

  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Form helpers ─────────────────────────────────────────
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
    setShowAddModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '', description: task.description || '',
      status: task.status || 'pending', priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowAddModal(false);
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message || 'Error creating task'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tasks/${selectedTask._id}`, formData);
      setShowEditModal(false);
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message || 'Error updating task'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting task'); }
    }
  };

  const priorityStyle = (p) => ({
    urgent: { bg: 'rgba(239,68,68,0.2)',   fg: '#f87171' },
    high:   { bg: 'rgba(245,158,11,0.2)', fg: '#fbbf24' },
    medium: { bg: 'rgba(255,255,255,0.1)', fg: '#e2e8f0' },
    low:    { bg: 'rgba(52,211,153,0.2)',  fg: '#6ee7b7' },
  }[p] || { bg: 'rgba(255,255,255,0.1)', fg: '#e2e8f0' });

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Task Pipeline</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Create Task</button>
      </div>

      {/* ── Toolbar — uses ApiFeatures on the backend ─────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 180px' }}
          placeholder="🔍 Search by title…"
          value={search}
          onChange={handleSearchChange}
        />
        <select style={{ ...inputStyle, flex: '0 0 145px' }} value={status} onChange={handleStatusChange}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
        <select style={{ ...inputStyle, flex: '0 0 145px' }} value={priority} onChange={handlePriorityChange}>
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select style={{ ...inputStyle, flex: '0 0 185px' }} value={sort} onChange={handleSortChange}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="dueDate">Due Date ↑</option>
          <option value="-dueDate">Due Date ↓</option>
        </select>
        {(search || status || priority) && (
          <button onClick={clearFilters} style={{ ...inputStyle, cursor: 'pointer', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No tasks match your filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Task', 'Priority', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const ps = priorityStyle(task.priority);
                return (
                  <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {task.title}
                      {task.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: ps.bg, color: ps.fg, textTransform: 'uppercase' }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={task.status}
                        onChange={async (e) => {
                          try { await api.patch(`/tasks/${task._id}`, { status: e.target.value }); fetchTasks(); }
                          catch { alert('Could not update status'); }
                        }}
                        style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEditModal(task)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(task._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="title" placeholder="Task Title" value={formData.title} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
                <select name="priority" value={formData.priority} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }} />
              </div>
              <textarea name="description" placeholder="Description…" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem', minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
