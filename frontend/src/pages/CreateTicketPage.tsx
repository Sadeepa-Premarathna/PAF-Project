import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CreateTicketPage.module.css';

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
          <button className={styles.backBtn} onClick={() => navigate('/tickets')}>← Back</button>
          <h1 className={styles.title}>Create New Ticket</h1>
          <p className={styles.sub}>Report a campus maintenance or incident issue</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Title *</label>
              <input name="title" className={styles.input} placeholder="Brief issue title" value={form.title} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Location / Resource *</label>
              <input name="resourceLocation" className={styles.input} placeholder="e.g. Room 301, Lab C" value={form.resourceLocation} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preferred Contact</label>
              <input name="preferredContact" className={styles.input} placeholder="Phone or email" value={form.preferredContact} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Category *</label>
              <select name="category" className={styles.select} value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Priority *</label>
              <select name="priority" className={styles.select} value={form.priority} onChange={handleChange} required>
                <option value="">Select priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description *</label>
            <textarea name="description" className={styles.textarea} placeholder="Describe the issue in detail..." value={form.description} onChange={handleChange} required rows={5} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Attach Images (max 3)</label>
            <div className={styles.dropzone}>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className={styles.fileInput} id="imgInput" disabled={images.length >= 3} />
              <label htmlFor="imgInput" className={styles.dropzoneLabel}>
                {images.length >= 3 ? '✓ Maximum images added' : '📎 Click to select images (JPEG, PNG, max 5MB each)'}
              </label>
            </div>
            {previews.length > 0 && (
              <div className={styles.previews}>
                {previews.map((src, i) => (
                  <div key={i} className={styles.previewItem}>
                    <img src={src} alt={`Preview ${i + 1}`} className={styles.previewImg} />
                    <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/tickets')}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
