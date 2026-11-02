
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { auth, db, storage } from "./firebase.jsx";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { ref, deleteObject } from "firebase/storage";

import MultiSelect from "./MultiSelect.jsx";
import "../styles/wardrobe.css";

// Clothing attributes
const editFields = [
  {
    field: "category",
    label: "Category",
    options: [
      "Top",
      "Bottom",
      "Dress",
      "Outerwear",
      "Shoes",
      "Accessories"
    ]
  },
  {
    field: "color",
    label: "Color",
    options: [
      "Black",
      "White",
      "Beige",
      "Brown",
      "Blue",
      "Red",
      "Green",
      "Pink",
      "Gray",
      "Other"
    ]
  },
  {
    field: "pattern",
    label: "Pattern",
    options: [
      "Solid",
      "Striped",
      "Floral",
      "Plaid",
      "Graphic",
      "Other"
    ]
  },
  {
    field: "season",
    label: "Season",
    options: [
      "Spring",
      "Summer",
      "Fall",
      "Winter",
      "All seasons"
    ]
  },
  {
    field: "occasion",
    label: "Occasion",
    options: [
      "Casual",
      "Work",
      "Formal",
      "Party",
      "Sport"
    ]
  }
];

// Supports both old string values and new array values
const toArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
};

// Display multiple values as text
const displayValues = (value) => {
  return toArray(value).join(", ");
};

// Default filters
const defaultFilters = {
  category: "All",
  color: "All",
  pattern: "All",
  season: "All",
  occasion: "All"
};

export default function Wardrobe() {
  const navigate = useNavigate();

  // Wardrobe data
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filters, setFilters] = useState(defaultFilters);

  // Editing
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Deleting
  const [deletingId, setDeletingId] = useState(null);

  // ---------------------------------------
  // 1. LOAD CURRENT USER'S CLOTHING
  // ---------------------------------------

  useEffect(() => {
    let unsubscribeClothes = () => {};

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeClothes();
        unsubscribeClothes = () => {};

        setClothes([]);
        setError("");

        if (!user) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const q = query(
          collection(db, "clothingItems"),
          where("userId", "==", user.uid)
        );

        unsubscribeClothes = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map((document) => ({
              ...document.data(),
              id: document.id
            }));

            setClothes(items);
            setLoading(false);
          },
          (err) => {
            console.error("Firestore error:", err);
            setError("Unable to load wardrobe items.");
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeClothes();
    };
  }, []);

  // ---------------------------------------
  // 2. DELETE CLOTHING
  // ---------------------------------------

  const handleDelete = async (item) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this clothing item?"
    );

    if (!confirmed) return;

    const user = auth.currentUser;

    if (!user || item.userId !== user.uid) {
      alert("You can only delete your own clothing items.");
      return;
    }

    setDeletingId(item.id);

    try {
      // Delete Firestore document first
      await deleteDoc(
        doc(db, "clothingItems", item.id)
      );

      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Firestore deletion failed:", err);
      alert("Unable to delete clothing item.");
      setDeletingId(null);
      return;
    }

    // Delete image from Firebase Storage
    if (item.imagePath) {
      try {
        await deleteObject(ref(storage, item.imagePath));
      } catch (err) {
        if (err.code !== "storage/object-not-found") {
          console.error("Storage deletion failed:", err);

          alert(
            "Clothing item deleted, but its image could not be removed from Storage."
          );

          setDeletingId(null);
          return;
        }
      }
    }

    setDeletingId(null);
    alert("Clothing item deleted successfully!");
  };

  // ---------------------------------------
  // 3. OPEN EDIT MODAL
  // ---------------------------------------

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditError("");

    setEditForm({
      name: item.name || "",
      category: toArray(item.category),
      color: toArray(item.color),
      pattern: toArray(item.pattern),
      season: toArray(item.season),
      occasion: toArray(item.occasion),
      notes: item.notes || ""
    });
  };

  const closeEditModal = () => {
    if (saving) return;

    setSelectedItem(null);
    setEditError("");
  };

  const handleEditChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  // ---------------------------------------
  // 4. SAVE EDITED CLOTHING
  // ---------------------------------------

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!selectedItem || saving) return;

    const user = auth.currentUser;

    if (!user || selectedItem.userId !== user.uid) {
      setEditError(
        "You can only edit your own clothing items."
      );
      return;
    }

    if (!editForm.name?.trim()) {
      setEditError("Please enter an item name.");
      return;
    }

    const missingField = editFields.some(
      ({ field }) => toArray(editForm[field]).length === 0
    );

    if (missingField) {
      setEditError(
        "Please select at least one option for every attribute."
      );
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      await updateDoc(
        doc(db, "clothingItems", selectedItem.id),
        {
          name: editForm.name.trim(),
          category: editForm.category,
          color: editForm.color,
          pattern: editForm.pattern,
          season: editForm.season,
          occasion: editForm.occasion,
          notes: (editForm.notes || "").trim()
        }
      );

      setSelectedItem(null);
    } catch (err) {
      console.error("Update error:", err);

      setEditError(
        "Unable to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // 5. FILTER CLOTHING
  // ---------------------------------------

  // Update a single filter
  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ ...defaultFilters });
  };

  // Match selected filters against clothing attributes
  const filteredClothes = clothes.filter((item) => {
    return Object.entries(filters).every(
      ([field, selected]) => {
        if (selected === "All") {
          return true;
        }

        return toArray(item[field]).includes(selected);
      }
    );
  });

  // Number of active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "All"
  ).length;

  // ---------------------------------------
  // 6. RENDER PAGE
  // ---------------------------------------

  return (
    <div className="wardrobe-page">

      {/* NAVBAR */}
      <header className="wardrobe-navbar">
        <Link to="/" className="wardrobe-logo">
          Rewear
        </Link>

        <Link to="/profile" className="wardrobe-nav-btn">
          My Profile
        </Link>
      </header>

      {/* PAGE HEADING */}
      <div className="wardrobe-header">
        <div>
          <h1>My Wardrobe</h1>
          <p>View and manage your clothes.</p>
        </div>

        <button
          className="add-button"
          onClick={() => navigate("/add-clothing")}
        >
          + Add Clothing
        </button>

        <button
          className="add-button"
          onClick={() => navigate("/wardrobe/analytics")}
        >
          View Wardrobe Insights
        </button>
      </div>

      {/* -----------------------------------
          FILTER SECTION
      ----------------------------------- */}

      <div className="wardrobe-filters">

        <div className="wardrobe-filter-grid">

          {editFields.map(({ field, label, options }) => {
            // Combine default options with custom
            // values saved in clothing items
            const allOptions = [
              ...new Set([
                ...options,
                ...clothes.flatMap((item) =>
                  toArray(item[field])
                )
              ])
            ].filter(Boolean);

            return (
              <label
                className="wardrobe-filter-field"
                key={field}
              >
                <span>{label}</span>

                <select
                  value={filters[field]}
                  onChange={(e) =>
                    handleFilterChange(
                      field,
                      e.target.value
                    )
                  }
                >
                  <option value="All">
                    {field === "category"
                      ? "All Categories"
                      : field === "color"
                      ? "All Colors"
                      : field === "pattern"
                      ? "All Patterns"
                      : field === "season"
                      ? "All Seasons"
                      : "All Occasions"}
                  </option>

                  {allOptions
                    .filter((option) => option !== "All")
                    .map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                </select>
              </label>
            );
          })}

        </div>

        <div className="wardrobe-filter-footer">
          <span>
            {activeFilterCount === 0
              ? "Showing all clothing items"
              : `${activeFilterCount} active ${
                  activeFilterCount === 1
                    ? "filter"
                    : "filters"
                }`}
          </span>

          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

      </div>

      {/* LOADING AND ERRORS */}
      {loading && <p>Loading wardrobe...</p>}

      {error && (
        <p role="alert">{error}</p>
      )}

      {!loading &&
        !error &&
        filteredClothes.length === 0 && (
          <p>No clothing items found.</p>
        )}

      {/* -----------------------------------
          CLOTHING GRID
      ----------------------------------- */}

      <div className="wardrobe-grid">
        {!loading &&
          !error &&
          filteredClothes.map((item) => (
            <div
              className="clothing-card"
              key={item.id}
            >

              <button
                type="button"
                className="clothing-preview-button"
                onClick={() => openEditModal(item)}
                aria-label={`Review ${
                  item.name ||
                  displayValues(item.category)
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name || "Clothing item"}
                  className="clothing-image"
                />

                <h3>
                  {item.name ||
                    displayValues(item.category) ||
                    "Unnamed Item"}
                </h3>

                <p>
                  {displayValues(item.category)}
                </p>

                <p>
                  {displayValues(item.color)}
                  {" · "}
                  {displayValues(item.pattern)}
                  {" · "}
                  {displayValues(item.season)}
                </p>

                <p>
                  {displayValues(item.occasion)}
                </p>

                <span className="review-hint">
                  Click to review &amp; edit
                </span>
              </button>

              <button
                type="button"
                className="delete-button"
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item)}
              >
                {deletingId === item.id
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>
          ))}
      </div>

      {/* -----------------------------------
          EDIT AND REVIEW MODAL
      ----------------------------------- */}

      {selectedItem && (
        <div
          className="edit-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="edit-modal-header">
              <div>
                <h2 id="edit-modal-title">
                  Clothing Details
                </h2>

                <p>
                  Review and edit your clothing item.
                </p>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="edit-modal-content">

              {/* CLOTHING IMAGE */}
              <div className="edit-modal-image">
                <img
                  src={selectedItem.imageUrl}
                  alt={
                    selectedItem.name ||
                    "Clothing item"
                  }
                />
              </div>

              {/* EDITABLE ATTRIBUTES */}
              <form
                className="edit-modal-form"
                onSubmit={handleSaveChanges}
              >

                {/* ITEM NAME */}
                <label className="edit-modal-field">
                  <span>Item Name</span>

                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      handleEditChange(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="e.g. My Favorite Summer Dress"
                    maxLength={100}
                    disabled={saving}
                    required
                  />
                </label>

                {/* MULTI-SELECT ATTRIBUTES */}
                {editFields.map(
                  ({ field, label, options }) => (
                    <MultiSelect
                      key={`${selectedItem.id}-${field}`}
                      label={label}
                      value={editForm[field] || []}
                      onChange={(values) =>
                        handleEditChange(field, values)
                      }
                      options={options}
                      disabled={saving}
                      className="edit-modal-field"
                    />
                  )
                )}

                {/* NOTES */}
                <label className="edit-modal-field">
                  <span>
                    Notes / Description (Optional)
                  </span>

                  <textarea
                    value={editForm.notes || ""}
                    onChange={(e) =>
                      handleEditChange(
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder="Add a short description or personal note..."
                    rows={3}
                    maxLength={500}
                    disabled={saving}
                  />

                  <small>
                    {(editForm.notes || "").length}
                    /500 characters
                  </small>
                </label>

                {/* EDIT ERROR */}
                {editError && (
                  <p
                    className="upload-error"
                    role="alert"
                  >
                    {editError}
                  </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="edit-modal-actions">

                  <button
                    type="button"
                    className="edit-cancel-button"
                    onClick={closeEditModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="edit-save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
