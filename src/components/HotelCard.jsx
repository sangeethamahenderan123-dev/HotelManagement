import React from "react";
import "./HotelCard.css";

function HotelCard({ hotel, onView, onEdit, onDelete }) {
  if (!hotel) return null;

  return (
    <article className="hotel-card">
      <div className="hotel-image-container">
        <img
          className="hotel-image"
          src={hotel.image || ""}
          alt={hotel.title || hotel.name || "Hotel"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
          }}
        />
      </div>

      <div className="hotel-content">
        <h3>{hotel.title || hotel.name || "Untitled Hotel"}</h3>

        <p className="hotel-description">
          {hotel.description || "No description available."}
        </p>

        {hotel.location && (
          <p className="hotel-location">📍 {hotel.location}</p>
        )}

        <p className="hotel-price">
          ₹{Number(hotel.price || 0).toLocaleString("en-IN")}
          <span> / night</span>
        </p>

        <div className="hotel-actions">
          <button
            type="button"
            className="view-btn"
            onClick={() => onView?.(hotel)}
          >
            View Details
          </button>

          <button
            type="button"
            className="edit-btn"
            onClick={() => onEdit?.(hotel)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={() => onDelete?.(hotel.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;