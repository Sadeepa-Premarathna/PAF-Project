import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './TicketDetailPage.module.css';

const API_BASE = 'http://localhost:8080';

const STATUS_FLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f97316', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', CLOSED: '#64748b', REJECTED: '#ef4444',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};

interface Comment { id: string; content: string; authorId: string; authorName: string; authorRole: string; createdAt: string; updatedAt: string; }
interface Ticket {
  id: string; title: string; description: string; resourceLocation: string; category: string;
  priority: string; status: string; preferredContact: string; resolutionNote: string; rejectionReason: string;
  createdBy: { id: string; name: string; email: string; department: string };
  assignedTo?: { id: string; name: string; email: string };
  imageUrls: string[]; comments: Comment[]; createdAt: string; updatedAt: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF_MEMBER';

  const fetchTicket = () => {
    if (!token || !id) return;
    fetch(`${API_BASE}/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setTicket)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id, token]);

  const handleUpdateStatus = async () => {
    if (!updateStatus) return;
    setSaving(true); setError(null);
    try {
      const body: Record<string, string> = { status: updateStatus };
      if (updateStatus === 'REJECTED') body.rejectionReason = rejectionReason;
      if (resolutionNote) body.resolutionNote = resolutionNote;
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
      fetchTicket();
      setUpdateStatus(''); setRejectionReason(''); setResolutionNote('');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText }),
      });
      setCommentText('');
      fetchTicket();
    } catch { setError('Failed to add comment'); }
    finally { setSaving(false); }
  };

  const handleEditComment = async (cid: string, content: string) => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/tickets/${id}/comments/${cid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      setEditingComment(null);
      fetchTicket();
    } catch { setError('Failed to edit comment'); }
    finally { setSaving(false); }
  };

  const handleDeleteComment = async (cid: string) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`${API_BASE}/api/tickets/${id}/comments/${cid}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    fetchTicket();
  };

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;
  if (!ticket) return <div className={styles.page}><div className={styles.loading}>Ticket not found.</div></div>;

  const statusIdx = STATUS_FLOW.indexOf(ticket.status);

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/tickets')}>← Back to Tickets</button>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.layout}>
        {/* ── LEFT: Ticket Info ── */}
        <div className={styles.main}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{ticket.title}</h1>
            <span className={styles.statusBadge} style={{ background: STATUS_COLORS[ticket.status] + '22', color: STATUS_COLORS[ticket.status] }}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>

          {/* Status Timeline */}
          {ticket.status !== 'REJECTED' && (
            <div className={styles.timeline}>
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className={styles.timelineStep}>
                  <div className={`${styles.timelineDot} ${i <= statusIdx ? styles.timelineDotActive : ''}`}
                    style={i <= statusIdx ? { background: STATUS_COLORS[ticket.status] } : {}}>
                    {i < statusIdx ? '✓' : i + 1}
                  </div>
                  <span className={`${styles.timelineLabel} ${i <= statusIdx ? styles.timelineLabelActive : ''}`}>{s.replace('_', ' ')}</span>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`${styles.timelineLine} ${i < statusIdx ? styles.timelineLineActive : ''}`}
                      style={i < statusIdx ? { background: STATUS_COLORS[ticket.status] } : {}} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.desc}>{ticket.description}</p>
          </div>

          {ticket.rejectionReason && (
            <div className={styles.rejectionBox}>
              <strong>Rejection Reason:</strong> {ticket.rejectionReason}
            </div>
          )}

          {ticket.resolutionNote && (
            <div className={styles.resolutionBox}>
              <strong>Resolution Note:</strong> {ticket.resolutionNote}
            </div>
          )}

          {/* Images */}
          {ticket.imageUrls?.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Evidence Images</h2>
              <div className={styles.imgGrid}>
                {ticket.imageUrls.map((url, i) => (
                  <a key={i} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer">
                    <img src={`${API_BASE}${url}`} alt={`evidence-${i + 1}`} className={styles.evidenceImg} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Comments ({ticket.comments?.length ?? 0})</h2>
            <div className={styles.comments}>
              {ticket.comments?.map(c => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{c.authorName}</span>
                    <span className={styles.commentRole}>{c.authorRole.replace('_', ' ')}</span>
                    <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  {editingComment?.id === c.id ? (
                    <div className={styles.editForm}>
                      <textarea className={styles.commentInput} rows={2}
                        value={editingComment.content}
                        onChange={e => setEditingComment({ ...editingComment, content: e.target.value })} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={styles.saveBtn} disabled={saving} onClick={() => handleEditComment(c.id, editingComment.content)}>Save</button>
                        <button className={styles.cancelBtn} onClick={() => setEditingComment(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.commentText}>{c.content}</p>
                  )}
                  {(c.authorId === user?.id || user?.role === 'ADMIN') && !editingComment && (
                    <div className={styles.commentActions}>
                      {c.authorId === user?.id && (
                        <button className={styles.editBtn} onClick={() => setEditingComment({ id: c.id, content: c.content })}>Edit</button>
                      )}
                      <button className={styles.deleteBtn} onClick={() => handleDeleteComment(c.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.commentBox}>
              <textarea className={styles.commentInput} placeholder="Add a comment..." rows={3}
                value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button className={styles.saveBtn} disabled={saving || !commentText.trim()} onClick={handleAddComment}>Post Comment</button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Ticket Info</h3>
            <div className={styles.infoRow}><span>Priority</span><span className={styles.prioBadge} style={{ color: PRIORITY_COLORS[ticket.priority] }}>{ticket.priority}</span></div>
            <div className={styles.infoRow}><span>Category</span><span>{ticket.category.replace('_', ' ')}</span></div>
            <div className={styles.infoRow}><span>Location</span><span>{ticket.resourceLocation}</span></div>
            <div className={styles.infoRow}><span>Contact</span><span>{ticket.preferredContact || '—'}</span></div>
            <div className={styles.infoRow}><span>Submitted by</span><span>{ticket.createdBy?.name}</span></div>
            <div className={styles.infoRow}><span>Dept</span><span>{ticket.createdBy?.department || '—'}</span></div>
            <div className={styles.infoRow}><span>Assigned to</span><span>{ticket.assignedTo?.name || 'Unassigned'}</span></div>
            <div className={styles.infoRow}><span>Opened</span><span>{new Date(ticket.createdAt).toLocaleDateString()}</span></div>
          </div>

          {/* Staff/Admin Controls */}
          {isStaffOrAdmin && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Update Ticket</h3>
              <select className={styles.select} value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>
                <option value="">Select new status...</option>
                {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                {user?.role === 'ADMIN' && <option value="REJECTED">REJECTED</option>}
              </select>

              {updateStatus === 'RESOLVED' && (
                <textarea className={styles.select} placeholder="Resolution note (optional)" rows={3}
                  value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
                  style={{ resize: 'vertical', marginTop: '10px' }} />
              )}
              {updateStatus === 'REJECTED' && (
                <textarea className={styles.select} placeholder="Reason for rejection *" rows={3}
                  value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                  style={{ resize: 'vertical', marginTop: '10px' }} />
              )}

              <button className={styles.saveBtn} disabled={saving || !updateStatus} onClick={handleUpdateStatus}
                style={{ width: '100%', marginTop: '10px' }}>
                {saving ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
