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
      <div className={styles.leafOverlay} />
      
      <div className={styles.header}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
        >
          ← Back
        </button>
        <h1 className={styles.title}>
          CAMPUS <span className={styles.orangeText}>RESOURCES</span>
        </h1>
        <p className={styles.subtitle}>
          {isAdmin 
            ? "Manage the facilities, laboratories, and assets available across the Smart Campus network."
            : "Explore the facilities, laboratories, and assets available across the Smart Campus network."}
        </p>
      </div>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.message}
        </div>
      )}

      {/* Admin Form Section - Only shown to admins */}
      {isAdmin && (
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>{editingId ? `Edit Resource #${editingId}` : "Register New Resource"}</h2>
          <form onSubmit={handleFormSubmit} className={styles.formGrid}>
            <div className={styles.field}>
              <label>Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Innovation Lab"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Type</label>
              <select
                className={styles.select}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {FORM_RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Capacity</label>
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
              <label>Location</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Block B, Floor 2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Available From</label>
              <input
                className={styles.input}
                type="time"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Available To</label>
              <input
                className={styles.input}
                type="time"
                value={formData.availableTo}
                onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select
                className={styles.select}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {RESOURCE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update Resource" : "Create Resource"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => { setEditingId(null); setFormData(initialFormData); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* Filter Section - Always shown */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
          <select
            className={styles.select}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t || "ALL"} value={t}>{t || "ALL TYPES"}</option>
            ))}
          </select>
          <input
            className={styles.input}
            type="number"
            placeholder="Min Capacity"
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Search location..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {loading && <div className={styles.spinnerSmall} />}
          <button 
            className={styles.cancelBtn} 
            style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { setFilters(initialFilters); }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', opacity: 0.6 }}>Loading catalogue...</p>
      ) : (
        <div className={styles.resourceGrid}>
          {resources.length === 0 && !fetchError && <p className={styles.subtitle}>No resources found matching your criteria.</p>}
          {fetchError && <p className={styles.subtitle} style={{ color: '#ef4444' }}>{fetchError}</p>}
          {resources.map((resource) => (
            <div key={resource.id} className={styles.card}>
              <div className={styles.cardImg}>
                {TYPE_EMOJIS[resource.type] || "📦"}
                <span className={`${styles.statusBadge} ${resource.status === "ACTIVE" ? styles.statusActive : styles.statusOut}`}>
                  {resource.status}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTag}>{resource.type}</div>
                <h3 className={styles.cardName}>{resource.name}</h3>
                <p className={styles.cardLoc}>📍 {resource.location}</p>
                
                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Capacity</span>
                    <span className={styles.statValue}>{resource.capacity} People</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Available</span>
                    <span className={styles.statValue}>{resource.availableFrom} - {resource.availableTo}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardActions}>
                {isAdmin ? (
                  <>
                    <button className={styles.editBtn} onClick={() => handleEdit(resource)}>Edit</button>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                    >
                      {deletingId === resource.id ? "..." : "Delete"}
                    </button>
                  </>
                ) : (
                  <button 
                    className={styles.primaryBtn} 
                    style={{ width: '100%', fontSize: '14px', padding: '10px' }}
                    onClick={() => navigate(`/bookings?resourceId=${resource.id}`)}
                    disabled={resource.status !== "ACTIVE"}
                  >
                    {resource.status === "ACTIVE" ? "Book Now" : "Unavailable"}
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
