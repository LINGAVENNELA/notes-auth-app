import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Dashboard({ user }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingNotes, setFetchingNotes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [user]);

  async function fetchNotes() {
    if (!user) return;

    setFetchingNotes(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch notes');
        console.error(error);
      } else {
        setNotes(data || []);
      }
    } catch (err) {
      setError('An error occurred while fetching notes');
      console.error(err);
    } finally {
      setFetchingNotes(false);
    }
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
            created_at: new Date(),
          },
        ])
        .select();

      if (error) {
        setError('Failed to create note');
        console.error(error);
      } else {
        setNotes([data[0], ...notes]);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError('An error occurred while creating the note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(id) {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        setError('Failed to delete note');
        console.error(error);
      } else {
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (err) {
      setError('An error occurred while deleting the note');
      console.error(err);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>📝 My Notes</h1>
          <p style={styles.userEmail}>{user?.email}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.formSection}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2c2c2c' }}>✨ Create New Note</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleCreateNote}>
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
            <textarea
              placeholder="Note Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={styles.textarea}
            />
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Note'}
            </button>
          </form>
        </div>

        <div style={styles.notesSection}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2c2c2c' }}>📌 Your Notes</h2>
          {fetchingNotes ? (
            <p style={styles.loading}>Loading notes...</p>
          ) : notes.length === 0 ? (
            <p style={styles.emptyMessage}>No notes yet. Create one to get started!</p>
          ) : (
            <div style={styles.notesList}>
              {notes.map((note) => (
                <div key={note.id} style={styles.noteCard}>
                  <h3 style={styles.noteTitle}>{note.title}</h3>
                  <p style={styles.noteContent}>{note.content}</p>
                  <div style={styles.noteFooter}>
                    <small style={styles.noteDate}>
                      {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                    </small>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF5F8 0%, #F0EBFF 100%)',
    padding: '30px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '30px 40px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(201, 162, 224, 0.1)',
    maxWidth: '1400px',
    margin: '0 auto 40px',
  },
  userEmail: {
    color: '#A89BBC',
    margin: '8px 0 0 0',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '12px 28px',
    backgroundColor: '#FFB3D9',
    color: '#6B4C7A',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(255, 179, 217, 0.3)',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(201, 162, 224, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '18px',
    border: '2px solid #F0D9F5',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#FFFBFD',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '18px',
    border: '2px solid #F0D9F5',
    borderRadius: '12px',
    fontSize: '14px',
    minHeight: '160px',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, sans-serif',
    transition: 'all 0.3s ease',
    resize: 'vertical',
    backgroundColor: '#FFFBFD',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'linear-gradient(135deg, #C9A2E0 0%, #FFB3D9 100%)',
    background: 'linear-gradient(135deg, #C9A2E0 0%, #FFB3D9 100%)',
    color: '#6B4C7A',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(201, 162, 224, 0.3)',
    transition: 'all 0.3s ease',
  },
  error: {
    backgroundColor: '#FFE0E9',
    color: '#C9436B',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '14px',
    borderLeft: '4px solid #FFB3D9',
  },
  notesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(201, 162, 224, 0.1)',
  },
  notesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  noteCard: {
    backgroundColor: 'linear-gradient(135deg, #FFF5F8 0%, #F0EBFF 100%)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(201, 162, 224, 0.15)',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255, 179, 217, 0.2)',
    cursor: 'pointer',
  },
  noteTitle: {
    margin: '0 0 12px 0',
    color: '#6B4C7A',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  noteContent: {
    margin: '0 0 14px 0',
    color: '#8B7BA8',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '14px',
    lineHeight: '1.6',
    maxHeight: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '14px',
    borderTop: '1px solid #f0f0f0',
  },
  noteDate: {
    color: '#a8a8a8',
    fontSize: '12px',
    fontWeight: '500',
  },
  deleteButton: {
    padding: '8px 14px',
    backgroundColor: '#FFB3D9',
    color: '#6B4C7A',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  loading: {
    textAlign: 'center',
    color: '#9b8b8b',
    padding: '40px 20px',
    fontSize: '16px',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#c0b5ad',
    padding: '40px 20px',
    fontSize: '16px',
    fontWeight: '500',
  },
};
