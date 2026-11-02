
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "./firebase.jsx";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import MultiSelect from "./MultiSelect.jsx";
import "../styles/AddClothing.css";

const fields = [
  {
    field: "category",
    label: "Category",
    options: [
      "Top", "Bottom", "Dress",
      "Outerwear", "Shoes", "Accessories"
    ]
  },
  {
    field: "color",
    label: "Color",
    options: [
      "Black", "White", "Beige", "Brown",
      "Blue", "Red", "Green", "Pink",
      "Gray", "Other"
    ]
  },
  {
    field: "pattern",
    label: "Pattern",
    options: [
      "Solid", "Striped", "Floral",
      "Plaid", "Graphic", "Other"
    ]
  },
  {
    field: "season",
    label: "Season",
    options: [
      "Spring", "Summer", "Fall",
      "Winter", "All seasons"
    ]
  },
  {
    field: "occasion",
    label: "Occasion",
    options: [
      "Casual", "Work", "Formal",
      "Party", "Sport"
    ]
  }
];

export default function AddClothing() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [itemName, setItemName] = useState("");

  const [attributes, setAttributes] = useState({
    category: [],
    color: [],
    pattern: [],
    season: [],
    occasion: []
  });

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleAttributeChange = (field, values) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: values
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (
      !allowedTypes.includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        "Please select a JPG, PNG, or WebP image under 5 MB."
      );
      e.target.value = "";
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError("Please log in before adding clothing.");
      return;
    }

    if (!image) {
      setError("Please upload a clothing image.");
      return;
    }

    if (!itemName.trim()) {
      setError("Please enter an item name.");
      return;
    }

    const missingField = fields.some(
      ({ field }) => attributes[field].length === 0
    );

    if (missingField) {
      setError(
        "Please select at least one option for every attribute."
      );
      return;
    }

    setLoading(true);

    let imageRef;
    let uploaded = false;

    try {
      const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      };

      const extension = extensions[image.type];
      const imageName = `${crypto.randomUUID()}.${extension}`;

      const imagePath =
        `clothing/${user.uid}/${imageName}`;

      imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, image, {
        contentType: image.type
      });

      uploaded = true;

      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "clothingItems"), {
        userId: user.uid,
        name: itemName.trim(),
        imageUrl,
        imagePath,

        category: attributes.category,
        color: attributes.color,
        pattern: attributes.pattern,
        season: attributes.season,
        occasion: attributes.occasion,

        notes: notes.trim(),
        createdAt: serverTimestamp()
      });

      navigate("/wardrobe");

    } catch (err) {
      console.error("Upload error:", err);

      if (uploaded && imageRef) {
        try {
          await deleteObject(imageRef);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }

      setError(
        "Unable to save clothing item. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-clothing-page">
      <header className="upload-header">
        <h2 className="brand">Rewear</h2>

        <button
          type="button"
          onClick={() => navigate("/wardrobe")}
        >
          My Wardrobe
        </button>
      </header>

      <main className="upload-container">
        <p className="eyebrow">
          YOUR DIGITAL CLOSET / ADD ITEM
        </p>

        <h1>Add to your wardrobe</h1>

        <p className="subtitle">
          Give your clothes a digital home. Upload a photo
          and tell us a little about your piece.
        </p>

        <form onSubmit={handleSubmit}>
          <section className="upload-card">
            <h3>01 — Clothing photo</h3>

            <label className="image-upload-box">
              {preview ? (
                <img
                  src={preview}
                  alt="Clothing preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">＋</span>

                  <strong>
                    Upload your clothing photo
                  </strong>

                  <p>
                    Choose a clear photo of a single clothing item
                  </p>

                  <span className="choose-photo">
                    Choose photo
                  </span>

                  <small>
                    JPG, PNG or WebP · Max 5 MB
                  </small>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>

            {preview && (
              <p className="photo-hint">
                Click the image to change your photo.
              </p>
            )}
          </section>

          <section className="upload-card">
            <h3>02 — Item details</h3>

            <div className="form-grid">
              <div className="form-field full-width">
                <label htmlFor="item-name">
                  Item Name
                </label>

                <input
                  id="item-name"
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) =>
                    setItemName(e.target.value)
                  }
                  placeholder="e.g. My Favorite Summer Dress"
                  maxLength={100}
                  disabled={loading}
                />
              </div>

              {fields.map(({ field, label, options }) => (
                <div
                  key={field}
                  className={
                    field === "category" ? "full-width" : ""
                  }
                >
                  <MultiSelect
                    label={label}
                    value={attributes[field]}
                    onChange={(values) =>
                      handleAttributeChange(field, values)
                    }
                    options={options}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            <div className="form-field notes-field">
              <label htmlFor="clothing-notes">
                Notes / Description (Optional)
              </label>

              <textarea
                id="clothing-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your clothing item, where you bought it, how it fits..."
                rows={4}
                maxLength={500}
                disabled={loading}
              />

              <small>
                {notes.length}/500 characters
              </small>
            </div>
          </section>

          {error && (
            <p className="upload-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/wardrobe")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "+ Add to Wardrobe"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
