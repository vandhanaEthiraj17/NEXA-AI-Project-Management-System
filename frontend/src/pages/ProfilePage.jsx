import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Briefcase, Building, Save, CheckCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ProfilePage = () => {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch profile from backend
    fetch('http://localhost:5000/api/user/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#5e6c84' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#172b4d', marginBottom: '0.5rem' }}>User Profile</h1>
        <p style={{ color: '#5e6c84' }}>Manage your personal information and application preferences.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #f4f5f7', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172b4d', margin: 0 }}>{profile.name}</h2>
            <p style={{ color: '#5e6c84', margin: '0.25rem 0 0 0' }}>{profile.role} • {profile.department}</p>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#44546f' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993a4' }} />
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid #dfe1e6', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#44546f' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993a4' }} />
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid #dfe1e6', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#44546f' }}>Current Role</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993a4' }} />
                <input 
                  type="text" 
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid #dfe1e6', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#44546f' }}>Department</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993a4' }} />
                <input 
                  type="text" 
                  value={profile.department}
                  onChange={(e) => setProfile({...profile, department: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid #dfe1e6', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '0.6rem 1.5rem', background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
              onMouseOver={e => !saving && (e.currentTarget.style.background = '#0065ff')}
              onMouseOut={e => !saving && (e.currentTarget.style.background = '#0052cc')}
            >
              {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
            {message && (
              <div style={{ color: '#00875a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <CheckCircle size={16} /> {message}
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default ProfilePage;
