import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CreateTicketPage.module.css';
// @ts-ignore
import { getResources } from '../api/resourceApi';
const API_BASE = 'http://localhost:8080';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'PROJECTOR', 'SECURITY', 'CLEANING', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CreateTicketPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    resourceLocation: '',
    category: '',
    priority: '',
    preferredContact: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const data = await getResources();
        setResources(data);
      } catch (err) {
        console.error("Failed to load resources for ticket creation");
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files].slice(0, 3));
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 3));
    setError(null);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.priority) {
      setError('Please select a category and priority.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Failed to create ticket');
      }
      const ticket = await res.json();

      // Upload images if any
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append('files', img));
        const imgRes = await fetch(`${API_BASE}/api/tickets/${ticket.id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!imgRes.ok) {
          const imgBody = await imgRes.json().catch(() => ({}));
          throw new Error(imgBody.message || 'Ticket created, but image upload failed');
        }
      }
      navigate('/tickets');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/tickets')}>← DASHBOARD</button>
          <h1 className={styles.title}>CREATE SUPPORT TICKET</h1>
          <p className={styles.sub}>Report a campus maintenance or incident issue to the technical team</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>TICKET TITLE *</label>
              <input name="title" className={styles.input} placeholder="Brief description of the issue" value={form.title} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>AFFECTED FACILITY / LOCATION *</label>
              {loadingResources ? (
                <select className={styles.select} disabled>
                  <option>INITIALIZING RESOURCES...</option>
                </select>
              ) : (
                <select 
                  name="resourceLocation" 
                  className={styles.select} 
                  value={form.resourceLocation} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select a facility...</option>
                  {resources.map(res => (
                    <option key={res.id} value={`${res.name} - ${res.location}`}>
                      {res.name} (Location: {res.location})
                    </option>
                  ))}
                  <option value="Other">OTHER LOCATION</option>
                </select>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>PREFERRED CONTACT METHOD</label>
              <input name="preferredContact" className={styles.input} placeholder="Email or Phone extension" value={form.preferredContact} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>ISSUE CATEGORY *</label>
              <select name="category" className={styles.select} value={form.category} onChange={handleChange} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>URGENCY LEVEL *</label>
              <select name="priority" className={styles.select} value={form.priority} onChange={handleChange} required>
                <option value="">Select priority...</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>DETAILED DESCRIPTION *</label>
            <textarea name="description" className={styles.textarea} placeholder="Please provide specific details about the issue..." value={form.description} onChange={handleChange} required rows={5} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>SUPPORTING EVIDENCE / IMAGES (MAX 3)</label>
            <div className={styles.dropzone}>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className={styles.fileInput} id="imgInput" disabled={images.length >= 3} />
              <label htmlFor="imgInput" className={styles.dropzoneLabel}>
                {images.length >= 3 ? '✓ ALL IMAGES ATTACHED' : 'ADD IMAGES (JPEG, PNG, MAX 5MB)'}
              </label>
            </div>
            {previews.length > 0 && (
              <div className={styles.previews}>
                {previews.map((src, i) => (
                  <div key={i} className={styles.previewItem}>
                    <img src={src} alt={`Preview ${i + 1}`} className={styles.previewImg} />
                    <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>X</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/tickets')}>CANCEL</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'PROCESSING...' : 'SUBMIT TICKET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
