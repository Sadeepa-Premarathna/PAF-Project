import { useEffect, useState } from "react";
import { createResource, deleteResource, getResources, updateResource } from "../api/resourceApi";
import "./ResourcesPage.css";

const RESOURCE_TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const FORM_RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

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
    loadResources(initialFilters);
  }, []);

  const loadResources = async (selectedFilters) => {
    setLoading(true);
    setFetchError("");

    try {
      const params = {};

      if (selectedFilters.type) {
        params.type = selectedFilters.type;
      }
      if (selectedFilters.capacity) {
        params.capacity = Number(selectedFilters.capacity);
      }
      if (selectedFilters.location.trim()) {
        params.location = selectedFilters.location.trim();
      }

      const data = await getResources(params);
      setResources(data);
    } catch (apiError) {
      setFetchError(apiError?.response?.data?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const clearAlert = () => {
    setAlert(null);
  };

  const getErrorMessage = (apiError, fallbackMessage) => {
    const baseMessage = apiError?.response?.data?.message;
    const validationErrors = apiError?.response?.data?.validationErrors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.map((item) => `${item.field}: ${item.message}`).join(" | ");
    }
    return baseMessage || fallbackMessage;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setAlert({ type: "error", message: "Name is required." });
      return false;
    }
    if (!formData.location.trim()) {
      setAlert({ type: "error", message: "Location is required." });
      return false;
    }
    if (!formData.capacity || Number(formData.capacity) < 1) {
      setAlert({ type: "error", message: "Capacity must be at least 1." });
      return false;
    }
    if (!formData.availableFrom || !formData.availableTo) {
      setAlert({ type: "error", message: "Available from/to are required." });
      return false;
    }
    if (formData.availableFrom >= formData.availableTo) {
      setAlert({ type: "error", message: "Available from must be earlier than available to." });
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    return {
      name: formData.name.trim(),
      type: formData.type,
      capacity: Number(formData.capacity),
      location: formData.location.trim(),
      availableFrom: formData.availableFrom,
      availableTo: formData.availableTo,
      status: formData.status,
    };
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadResources(filters);
  };

  const handleClear = async () => {
    setFilters(initialFilters);
    await loadResources(initialFilters);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    clearAlert();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await updateResource(editingId, payload);
        setAlert({ type: "success", message: `Resource #${editingId} updated successfully.` });
      } else {
        await createResource(payload);
        setAlert({ type: "success", message: "Resource created successfully." });
      }
      resetForm();
      await loadResources(filters);
    } catch (apiError) {
      setAlert({ type: "error", message: getErrorMessage(apiError, "Failed to save resource.") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    clearAlert();
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
    clearAlert();

    if (!window.confirm(`Delete resource #${resourceId}?`)) {
      return;
    }

    setDeletingId(resourceId);
    try {
      await deleteResource(resourceId);
      if (editingId === resourceId) {
        resetForm();
      }
      setAlert({ type: "success", message: `Resource #${resourceId} deleted successfully.` });
      await loadResources(filters);
    } catch (apiError) {
      setAlert({ type: "error", message: getErrorMessage(apiError, "Failed to delete resource.") });
    } finally {
      setDeletingId(null);
    }
  };

  const renderStatusClass = (status) => {
    return status === "ACTIVE" ? "status-badge status-active" : "status-badge status-out";
  };

  return (
    <section className="resources-page">
      <h1>Facilities & Assets Catalogue</h1>

      {alert && (
        <div className={`alert ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          {alert.message}
        </div>
      )}

      <form className="resource-form" onSubmit={handleFormSubmit}>
        <h2>{editingId ? `Edit Resource #${editingId}` : "Add Resource"}</h2>

        <input
          type="text"
          name="name"
          placeholder="Resource name"
          value={formData.name}
          onChange={handleFormChange}
          required
        />

        <select name="type" value={formData.type} onChange={handleFormChange}>
          {FORM_RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="capacity"
          min="1"
          placeholder="Capacity"
          value={formData.capacity}
          onChange={handleFormChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleFormChange}
          required
        />

        <input
          type="time"
          name="availableFrom"
          value={formData.availableFrom}
          onChange={handleFormChange}
          required
        />

        <input
          type="time"
          name="availableTo"
          value={formData.availableTo}
          onChange={handleFormChange}
          required
        />

        <select name="status" value={formData.status} onChange={handleFormChange}>
          {RESOURCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="form-actions">
          <button type="submit" className="btn-search" disabled={submitting || deletingId !== null}>
            {submitting ? "Saving..." : editingId ? "Update Resource" : "Add Resource"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-clear"
              onClick={resetForm}
              disabled={submitting || deletingId !== null}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <form className="filter-form" onSubmit={handleSearch}>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          {RESOURCE_TYPES.map((type) => (
            <option key={type || "ALL"} value={type}>
              {type || "ALL TYPES"}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="capacity"
          min="1"
          placeholder="Min capacity"
          value={filters.capacity}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location contains..."
          value={filters.location}
          onChange={handleFilterChange}
        />

        <button type="submit" className="btn-search" disabled={loading || submitting || deletingId !== null}>
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          className="btn-clear"
          onClick={handleClear}
          disabled={loading || submitting || deletingId !== null}
        >
          Clear
        </button>
      </form>

      {fetchError && <p className="error-text">{fetchError}</p>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Available From</th>
              <th>Available To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && !loading ? (
              <tr>
                <td colSpan="9">No resources found.</td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.id}</td>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>
                  <td>{resource.availableFrom}</td>
                  <td>{resource.availableTo}</td>
                  <td>
                    <span className={renderStatusClass(resource.status)}>{resource.status}</span>
                  </td>
                  <td className="action-cell">
                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(resource)}
                      disabled={submitting || deletingId !== null}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(resource.id)}
                      disabled={submitting || deletingId !== null}
                    >
                      {deletingId === resource.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ResourcesPage;
