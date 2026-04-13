import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // Check API health on load
  useEffect(() => {
    checkHealth();
    fetchUsers();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'ERROR', error: 'Cannot reach API' });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setNewUser({ name: '', email: '' });
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Three-Tier Serverless App</h1>
        <p>IAM(OPS) India Pvt. Ltd. | Built on AWS</p>
      </header>

      {/* API Status */}
      <div className={`status-badge ${health?.status === 'OK' ? 'status-ok' : 'status-error'}`}>
        API Status: {health?.status || 'Checking...'} | DB: {health?.database || '...'}
      </div>

      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          ⚠️ {error} (click to dismiss)
        </div>
      )}

      {/* Add User Form */}
      <div className="card">
        <h2>Add New User</h2>
        <form onSubmit={createUser} className="form">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="card">
        <h2>Users ({users.length})</h2>
        {loading && <p>Loading...</p>}
        {users.length === 0 && !loading && <p>No users yet. Add one above!</p>}
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="footer">
        <p>Architecture: React (S3) → API Gateway → Lambda → RDS MySQL</p>
        <p>Deployed via GitHub Actions CI/CD Pipeline</p>
      </footer>
    </div>
  );
}

export default App;
