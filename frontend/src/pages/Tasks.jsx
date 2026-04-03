import { useState, useEffect } from 'react';
import api from '../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data.tasks || res.data.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
    setShowAddModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tasks/${selectedTask._id}`, formData);
      setShowEditModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting task');
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Task Pipeline</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Create Task</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No tasks assigned. Enjoy your day!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Task</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Priority</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Due Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {task.title}
                    {task.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)'}}>{task.description}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: task.priority === 'urgent' ? 'rgba(239, 68, 68, 0.2)' : 
                                   task.priority === 'high' ? 'rgba(245, 158, 11, 0.2)' : 
                                   task.priority === 'low' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: task.priority === 'urgent' ? '#f87171' : 
                             task.priority === 'high' ? '#fbbf24' : 
                             task.priority === 'low' ? '#6ee7b7' : '#e2e8f0',
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={task.status} 
                      onChange={async(e) => { 
                          try { await api.patch(`/tasks/${task._id}`, { status: e.target.value }); fetchTasks(); }
                          catch { alert('Could not update status'); } 
                      }}
                      style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem' }}
                    >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(task)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(task._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="title" placeholder="Task Title (e.g. Call John)" value={formData.title} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                </select>
                <select name="priority" value={formData.priority} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              </div>

              <textarea name="description" placeholder="Description details..." value={formData.description} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', minHeight: '80px' }} />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
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
