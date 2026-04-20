import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './TicketDetailPage.module.css';
import staffStyles from './TicketsPage.staff.module.css';

const API_BASE = 'http://localhost:8080';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f97316', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', CLOSED: '#64748b', REJECTED: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};

interface Comment {
  id: number; text: string; authorName: string; authorRole: string; createdAt: string;
}

interface Ticket {
  id: string; title: string; description: string; status: string; priority: string;
  category: string; resourceLocation: string; createdAt: string; imageUrls?: string[];
  rejectionReason?: string; resolution?: string; preferredContact?: string;
  createdBy: { name: string; email: string };
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Admin Reply Wizard State
  const [wizardStep, setWizardStep] = useState(1); // 1: Select Action, 2: Details, 3: Review
  const [selectedAction, setSelectedAction] = useState<'MESSAGE' | 'PROGRESS' | 'RESOLVE' | 'REJECT' | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const isStaff = user?.role === 'STAFF_MEMBER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/tickets/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(async ([ticketRes, commentRes]) => {
      if (ticketRes.ok) setTicket(await ticketRes.json());
      if (commentRes.ok) setComments(await commentRes.json());
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id, token]);

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const added = await res.json();
        setComments(prev => [...prev, added]);
        setNewComment('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !ticket) return;
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTicket({ ...ticket, status: newStatus });
      }
    } catch (err) {
       console.error("Status update failed", err);
    }
  };

  const handleAdminSubmit = async () => {
    if (!token || !ticket || !selectedAction || submitting) return;
    setSubmitting(true);
    try {
      let finalStatus = ticket.status;
      if (selectedAction === 'PROGRESS') finalStatus = 'IN_PROGRESS';
      if (selectedAction === 'RESOLVE') finalStatus = 'RESOLVED';
      if (selectedAction === 'REJECT') finalStatus = 'REJECTED';

      // Update status and optional notes
      const updateRes = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: finalStatus,
          resolutionNote: selectedAction === 'RESOLVE' ? adminReply : undefined,
          rejectionReason: selectedAction === 'REJECT' ? adminReply : undefined,
        }),
      });

      // Add comment if it's just a message or if we want to log the progress
      if (selectedAction === 'MESSAGE' || (selectedAction === 'PROGRESS' && adminReply)) {
        await fetch(`${API_BASE}/api/tickets/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: adminReply }),
        });
      }

      if (updateRes.ok) {
        // Refresh ticket and comments
        const [t, c] = await Promise.all([
          fetch(`${API_BASE}/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
          fetch(`${API_BASE}/api/tickets/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
        ]);
        setTicket(t);
        setComments(c);
        
        // Reset Wizard & Close Modal
        setWizardStep(1);
        setSelectedAction(null);
        setAdminReply('');
        setIsConsoleOpen(false);
      }
    } catch (err) {
      console.error("Admin action failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.page}><div className={styles.loader}>INITIALIZING GATEWAY...</div></div>;
  if (!ticket) return <div className={styles.page}>Ticket not found.</div>;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/tickets')}>← BACK TO HUB</button>

      <div className={styles.titleRow}>
        <h1 className={styles.title}>TICKET <span>#{ticket.id.toString().padStart(4, '0')}</span></h1>
        <div 
          className={styles.statusBadge} 
          style={{ borderColor: STATUS_COLORS[ticket.status], color: STATUS_COLORS[ticket.status], background: STATUS_COLORS[ticket.status] + '12' }}
        >
          {ticket.status.replace('_', ' ')}
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((step, i, arr) => {
          const isActive = arr.indexOf(ticket.status) >= i;
          return (
            <div key={step} className={styles.timelineStep}>
              <div className={`${styles.timelineDot} ${isActive ? styles.timelineDotActive : ''}`}>{i + 1}</div>
              <span className={`${styles.timelineLabel} ${isActive ? styles.timelineLabelActive : ''}`}>{step.replace('_', ' ')}</span>
              {i < arr.length - 1 && <div className={`${styles.timelineLine} ${arr.indexOf(ticket.status) > i ? styles.timelineLineActive : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className={styles.layout}>
        {/* Main Content */}
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ISSUE OVERVIEW</h2>
            <h3 style={{ margin: '0 0 12px', fontSize: '20px' }}>{ticket.title}</h3>
            <p className={styles.desc}>{ticket.description}</p>
            
            {ticket.imageUrls && ticket.imageUrls.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <span className={styles.sectionTitle} style={{ fontSize: '14px' }}>ATTACHED EVIDENCE</span>
                <div className={styles.imgGrid}>
                  {ticket.imageUrls.map((url, i) => (
                    <img key={i} src={`${API_BASE}${url}`} alt="Evidence" className={styles.evidenceImg} onClick={() => window.open(`${API_BASE}${url}`)} />
                  ))}
                </div>
              </div>
            )}

            {ticket.status === 'REJECTED' && (
              <div className={styles.rejectionBox}>
                <strong>REJECTION REASON:</strong> {ticket.rejectionReason}
              </div>
            )}
            
            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.resolution && (
              <div className={styles.resolutionBox}>
                <strong>RESOLUTION NOTES:</strong> {ticket.resolution}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>COMMUNICATION LOG</h2>
            <div className={styles.comments}>
              {comments.map(c => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={styles.commentAuthor}>{c.authorName}</span>
                      <span className={`${styles.commentRole} ${c.authorRole !== 'STUDENT' ? styles.staffBadge : ''}`}>
                        {c.authorRole}
                      </span>
                    </div>
                    <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className={styles.commentText}>{c.text}</p>
                </div>
              ))}
            </div>

            <div className={styles.commentBox}>
              <textarea 
                className={styles.commentInput} 
                placeholder="Type your message here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className={styles.saveBtn} 
                  disabled={!newComment.trim() || submitting}
                  onClick={handleAddComment}
                >
                  {submitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>TICKET METADATA</h2>
            <div className={styles.infoRow}>
              <span>PRIORITY LEVEL</span>
              <span className={styles.prioBadge} style={{ color: PRIORITY_COLORS[ticket.priority], borderColor: PRIORITY_COLORS[ticket.priority] }}>
                {ticket.priority}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span>CATEGORY</span>
              <span>{ticket.category.replace('_', ' ')}</span>
            </div>
            <div className={styles.infoRow}>
              <span>LOCATION</span>
              <span>{ticket.resourceLocation}</span>
            </div>
            <div className={styles.infoRow}>
              <span>REPORTED BY</span>
              <span>{ticket.createdBy?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span>CREATED ON</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {isStaff && (
            <div className={styles.infoCard} style={{ borderLeft: '4px solid var(--accent)' }}>
              <h2 className={styles.infoTitle}>STAFF OPERATIONS</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-ghost)', marginBottom: '16px' }}>
                Use the console to respond, update progress, or resolve this ticket.
              </p>
              <button className={styles.openConsoleBtn} onClick={() => setIsConsoleOpen(true)}>
                OPEN RESPONSE CONSOLE
              </button>
            </div>
          )}

          {isConsoleOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.consoleCard}>
                <button className={styles.closeModal} onClick={() => setIsConsoleOpen(false)}>×</button>
                <h2 className={styles.infoTitle}>ADMIN RESPONSE CONSOLE</h2>
                
                <div className={styles.wizardProgress}>
                  <div className={`${styles.wizardDot} ${wizardStep >= 1 ? styles.wizardDotActive : ''}`}>1</div>
                  <div className={`${styles.wizardLine} ${wizardStep >= 2 ? styles.wizardLineActive : ''}`} />
                  <div className={`${styles.wizardDot} ${wizardStep >= 2 ? styles.wizardDotActive : ''}`}>2</div>
                  <div className={`${styles.wizardLine} ${wizardStep >= 3 ? styles.wizardLineActive : ''}`} />
                  <div className={`${styles.wizardDot} ${wizardStep >= 3 ? styles.wizardDotActive : ''}`}>3</div>
                </div>

                {wizardStep === 1 && (
                  <div className={styles.stepContent}>
                    <p className={styles.stepLabel}>Step 1: Choose Operational Action</p>
                    <div className={styles.actionGrid}>
                      <button 
                        className={`${styles.actionBtn} ${selectedAction === 'MESSAGE' ? styles.actionBtnActive : ''}`}
                        onClick={() => { setSelectedAction('MESSAGE'); setWizardStep(2); }}
                      >
                        SEND MESSAGE
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${selectedAction === 'PROGRESS' ? styles.actionBtnActive : ''}`}
                        onClick={() => { setSelectedAction('PROGRESS'); setWizardStep(2); }}
                      >
                        IN PROGRESS
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${selectedAction === 'RESOLVE' ? styles.actionBtnActive : ''}`}
                        onClick={() => { setSelectedAction('RESOLVE'); setWizardStep(2); }}
                      >
                        RESOLVE
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${selectedAction === 'REJECT' ? styles.actionBtnActive : ''}`}
                        onClick={() => { setSelectedAction('REJECT'); setWizardStep(2); }}
                      >
                        REJECT
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className={styles.stepContent}>
                    <p className={styles.stepLabel}>
                      Step 2: {selectedAction === 'RESOLVE' ? 'Resolution Details' : selectedAction === 'REJECT' ? 'Rejection Reason' : 'Enter Message'}
                    </p>
                    <textarea 
                      className={styles.commentInput} 
                      placeholder={selectedAction === 'RESOLVE' ? "Describe how it was fixed..." : "Type your message to the student..."}
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                    />
                    <div className={styles.stepActions}>
                      <button className={styles.backBtnSmall} onClick={() => setWizardStep(1)}>BACK</button>
                      <button 
                        className={styles.nextBtn} 
                        disabled={!adminReply.trim()}
                        onClick={() => setWizardStep(3)}
                      >
                        PREVIEW
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className={styles.stepContent}>
                    <p className={styles.stepLabel}>Step 3: Final Review</p>
                    <div className={styles.reviewBox}>
                      <div className={styles.reviewRow}>
                        <span>Action:</span>
                        <strong style={{ color: 'var(--accent)' }}>{selectedAction}</strong>
                      </div>
                      <div className={styles.reviewRow}>
                        <span>Status Change:</span>
                        <strong style={{ color: 'var(--accent)' }}>
                          {ticket.status} → {
                            selectedAction === 'PROGRESS' ? 'IN_PROGRESS' : 
                            selectedAction === 'RESOLVE' ? 'RESOLVED' : 
                            selectedAction === 'REJECT' ? 'REJECTED' : ticket.status
                          }
                        </strong>
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <span className={styles.stepLabel} style={{ fontSize: '10px' }}>MESSAGE PREVIEW:</span>
                        <p className={styles.previewText}>"{adminReply}"</p>
                      </div>
                    </div>
                    <div className={styles.stepActions}>
                      <button className={styles.backBtnSmall} onClick={() => setWizardStep(2)}>BACK</button>
                      <button className={styles.confirmBtn} onClick={handleAdminSubmit} disabled={submitting}>
                        {submitting ? 'EXECUTING...' : 'CONFIRM & SEND'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
