import { useEffect, useState } from "react";
import { createResource, deleteResource, getResources, updateResource } from "../api/resourceApi";
import styles from "./ResourcesPage.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RESOURCE_TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const FORM_RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const TYPE_EMOJIS = {
  LECTURE_HALL: "🏛️",
  LAB: "🧪",
  MEETING_ROOM: "👥",
  EQUIPMENT: "🛠️",
};

const initialFilters = {
  type: "",
  capacity: "",
  location: "",
};

const initialFormData = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  availableFrom: "08:00",
  availableTo: "17:00",
  status: "ACTIVE",
};

function ResourcesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResources(filters);
    }, 400); // 400ms debounce for typing
    return () => clearTimeout(timer);
  }, [filters]);

  const loadResources = async (selectedFilters) => {
    setLoading(true);
    setFetchError("");

    try {
      const params = {};
      if (selectedFilters.type) params.type = selectedFilters.type;
      if (selectedFilters.capacity && Number(selectedFilters.capacity) > 0) {
        params.capacity = Number(selectedFilters.capacity);
      }
      if (selectedFilters.location?.trim()) {
        params.location = selectedFilters.location.trim();
      }

      const data = await getResources(params);
      setResources(data);
    } catch (apiError) {
      const msg = apiError?.response?.data?.message || "Failed to load resources";
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setAlert(null);

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingId) {
        await updateResource(editingId, payload);
        setAlert({ type: "success", message: `Resource #${editingId} updated successfully.` });
      } else {
        await createResource(payload);
        setAlert({ type: "success", message: "Resource created successfully." });
      }
      setFormData(initialFormData);
      setEditingId(null);
      await loadResources(filters);
    } catch (apiError) {
      const resp = apiError?.response?.data;
      let msg = "Failed to save resource.";
      
      if (typeof resp === 'string') {
        msg = resp;
      } else if (resp?.message) {
        msg = resp.message;
      }
      
      // Handle validation errors if present
      if (resp?.errors && Array.isArray(resp.errors)) {
        msg = `${msg}: ${resp.errors.join(", ")}`;
      }
      
      setAlert({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: String(resource.capacity),
      location: resource.location,
      availableFrom: resource.availableFrom,
      availableTo: resource.availableTo,
      status: resource.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm(`Delete resource #${resourceId}?`)) return;

    setDeletingId(resourceId);
    try {
      await deleteResource(resourceId);
      setAlert({ type: "success", message: `Resource #${resourceId} deleted successfully.` });
      await loadResources(filters);
    } catch (apiError) {
      setAlert({ type: "error", message: "Failed to delete resource." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      
      {/* ─── HEADER ─── */}
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← BACK TO CONTROL
        </button>
        <h1 className={styles.title}>
          CAMPUS <span>RESOURCES</span>
        </h1>
        <p className={styles.subtitle}>
          {isAdmin 
            ? "Centralized oversight: Modify resource availability, update technical specifications, and manage structural deployment across all campus sectors."
            : "Authorized access: Secure reservations for state-of-the-art facilities, laboratories, and specialized equipment available on the Smart Camus network."}
        </p>
      </header>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alert.type === "success" ? "✓" : "⚠"}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      {/* ─── ADMIN FORM ─── */}
      {isAdmin && (
        <section className={styles.formCard}>
          <div style={{ position: 'absolute', top: '15px', right: '25px', opacity: 0.1, fontSize: '40px', fontWeight: 900, pointerEvents: 'none' }}>01</div>
          <h2 className={styles.formTitle}>{editingId ? `UPDATE UNIT #${editingId}` : "REGISTER NEW ARCHITECTURE"}</h2>
          <form onSubmit={handleFormSubmit} className={styles.formGrid}>
            <div className={styles.field}>
              <label>RESOURCE IDENTIFIER</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. CORE LAB ALPHA"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>FUNCTIONAL CLASSIFICATION</label>
              <select
                className={styles.select}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {FORM_RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: '#080d08' }}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>CAPACITY LIMIT (PERSONS)</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>GEOSPATIAL COORDINATES (LOCATION)</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. SECTOR 07 / LEVEL 02"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>OPERATIONAL START</label>
              <input
                className={styles.input}
                type="time"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>OPERATIONAL TERMINATION</label>
              <input
                className={styles.input}
                type="time"
                value={formData.availableTo}
                onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>STATUS PROTOCOL</label>
              <select
                className={styles.select}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {RESOURCE_STATUSES.map((s) => (
                  <option key={s} value={s} style={{ background: '#080d08' }}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={submitting} style={{ width: '220px' }}>
                {submitting ? "SYNCHRONIZING..." : editingId ? "COMMIT UPDATE" : "INITIALIZE ENTITY"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => { setEditingId(null); setFormData(initialFormData); }}
                >
                  ABORT
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ─── FILTERS ─── */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', fontSize: '10px', color: 'var(--accent)', fontWeight: 800 }}>TYPE</span>
            <select
              className={styles.select}
              style={{ paddingLeft: '45px', width: '200px' }}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t || "ALL"} value={t} style={{ background: '#080d08' }}>{t ? t.replace('_', ' ') : "ALL CLASSES"}</option>
              ))}
            </select>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', fontSize: '10px', color: 'var(--accent)', fontWeight: 800 }}>MIN_CAP</span>
            <input
              className={styles.input}
              style={{ paddingLeft: '65px', width: '130px' }}
              type="number"
              placeholder="0"
              value={filters.capacity}
              onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
            />
          </div>
          <input
            className={styles.input}
            type="text"
            placeholder="Filter location coordinates..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            style={{ width: '250px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className={styles.cancelBtn} 
            onClick={() => { setFilters(initialFilters); }}
            style={{ fontSize: '12px', padding: '10px 16px' }}
          >
            RESET FILTERS
          </button>
        </div>
      </div>

      {/* ─── GRID ─── */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : (
        <div className={styles.resourceGrid}>
          {resources.length === 0 && !fetchError && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', border: '1px dashed var(--border)', borderRadius: '24px' }}>
                <p className={styles.subtitle}>System unable to locate entities matching current search parameters.</p>
             </div>
          )}
          {fetchError && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.05)' }}>
                <p className={styles.subtitle} style={{ color: '#ef4444' }}>SIGNAL INTERFERENCE: {fetchError}</p>
             </div>
          )}
          {resources.map((resource) => (
            <div key={resource.id} className={styles.card}>
              <div className={styles.cardImg}>
                {TYPE_EMOJIS[resource.type] || "📦"}
                <span className={`${styles.statusBadge} ${resource.status === "ACTIVE" ? styles.statusActive : styles.statusOut}`}>
                  {resource.status}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTag}>{resource.type.replace('_', ' ')}</div>
                <h3 className={styles.cardName}>{resource.name}</h3>
                <p className={styles.cardLoc}>LOC: {resource.location}</p>
                
                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>CAPACITY</span>
                    <span className={styles.statValue}>{resource.capacity} PAX</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>OPERATING_BLOCK</span>
                    <span className={styles.statValue}>{resource.availableFrom} - {resource.availableTo}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardActions}>
                {isAdmin ? (
                  <>
                    <button className={styles.editBtn} onClick={() => handleEdit(resource)}>RECONFIGURE</button>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                    >
                      {deletingId === resource.id ? "DELETING..." : "DISMANTLE"}
                    </button>
                  </>
                ) : (
                  <button 
                    className={styles.primaryBtn} 
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/bookings?resourceId=${resource.id}`)}
                    disabled={resource.status !== "ACTIVE"}
                  >
                    {resource.status === "ACTIVE" ? "AUTHORIZE ACCESS" : "ENTITY DEACTIVATED"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default ResourcesPage;
