import React, { useEffect, useRef, useState } from "react";
import "./HotelForm.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const emptyForm = {
  name: "",
  location: "",
  latitude: "",
  longitude: "",
  price: "",
  rating: "",
  image: "",
  description: "",
};

function HotelForm({ hotel, onSave, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.title || hotel.name || "",
        location: hotel.location || "",
        latitude: hotel.latitude || "",
        longitude: hotel.longitude || "",
        price: hotel.price ?? "",
        rating: hotel.rating ?? "",
        image: hotel.image || "",
        description: hotel.description || "",
      });
    } else {
      setFormData({ ...emptyForm });
    }

    setImageError("");
    setSaving(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [hotel]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setImageError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageError(
          "Unable to read this image. Try another file."
        );
        return;
      }

      setFormData((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.onerror = () => {
      setImageError(
        "Unable to read this image. Please try again."
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));

    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    const hotelData = {
      ...formData,
      title: formData.name.trim(),

      location: formData.location.trim(),

      latitude: formData.latitude.trim(),

      longitude: formData.longitude.trim(),

      price: Number(formData.price),

      rating: Number(formData.rating),

      image: formData.image || "",
    };

    delete hotelData.name;

    try {
      onSave(hotelData);
    } catch (error) {
      console.error("Unable to save hotel:", error);
      setImageError(
        "Unable to save hotel. Please try again."
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="hotel-form-overlay"
      onClick={onCancel}
    >
      <div
        className="hotel-form-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="hotel-form-close"
          onClick={onCancel}
          aria-label="Close form"
        >
          ×
        </button>

        <h2>
          {hotel ? "Edit Hotel" : "Add New Hotel"}
        </h2>

        <p className="hotel-form-subtitle">
          {hotel
            ? "Update your hotel details below."
            : "Enter the details to add a new hotel."}
        </p>

        <form onSubmit={handleSubmit}>

          {/* Hotel Name */}
          <div className="hotel-form-group">
            <label htmlFor="name">
              Hotel Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter hotel name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          {/* Location */}
          <div className="hotel-form-group">
            <label htmlFor="location">
              Location *
            </label>

            <input
              id="location"
              name="location"
              type="text"
              placeholder="Enter hotel location"
              value={formData.location}
              onChange={handleChange}
              required
              maxLength={150}
            />
          </div>

          {/* Latitude + Longitude */}
          <div className="hotel-form-row">

            <div className="hotel-form-group">
              <label htmlFor="latitude">
                Latitude
              </label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="11.0168"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="hotel-form-group">
              <label htmlFor="longitude">
                Longitude
              </label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="76.9558"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Price + Rating */}
          <div className="hotel-form-row">

            <div className="hotel-form-group">
              <label htmlFor="price">
                Price per Night (₹) *
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="1"
                placeholder="2500"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hotel-form-group">
              <label htmlFor="rating">
                Rating (0–5) *
              </label>

              <input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Hotel Image */}
          <div className="hotel-form-group">
            <label htmlFor="hotelImage">
              Hotel Image
            </label>

            <div className="hotel-image-upload">

              {formData.image ? (
                <div className="hotel-image-preview-wrap">

                  <img
                    src={formData.image}
                    alt="Hotel preview"
                    className="hotel-image-preview"
                  />

                  <button
                    type="button"
                    className="hotel-image-remove"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>

                </div>
              ) : (
                <div className="hotel-image-placeholder">

                  <span className="hotel-upload-icon">
                    ↑
                  </span>

                  <strong>
                    Upload hotel image
                  </strong>

                  <span>
                    PNG, JPG, WEBP — up to 2 MB
                  </span>

                </div>
              )}

              <input
                ref={fileInputRef}
                id="hotelImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <label
                htmlFor="hotelImage"
                className="hotel-image-choose"
              >
                {formData.image
                  ? "Change Image"
                  : "Choose Image"}
              </label>

            </div>

            {imageError && (
              <p
                className="hotel-image-error"
                role="alert"
              >
                {imageError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="hotel-form-group">

            <label htmlFor="description">
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Enter hotel description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              maxLength={1000}
            />

          </div>

          {/* Buttons */}
          <div className="hotel-form-buttons">

            <button
              type="button"
              className="hotel-form-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="hotel-form-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : hotel
                ? "Update Hotel"
                : "Add Hotel"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default HotelForm;