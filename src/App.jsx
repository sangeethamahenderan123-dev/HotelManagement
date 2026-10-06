import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import HotelCard from "./components/HotelCard";
import HotelForm from "./components/HotelForm";
import Pagination from "./components/Pagination";

const STORAGE_KEY = "hotelhub-hotels";
const ITEMS_PER_PAGE = 3;

const initialHotels = [
  {
    id: 1,
    title: "Grand Palace Hotel",
    description: "Comfortable rooms with modern amenities.",
    price: 2500,
    latitude: "11.0168",
    longitude: "76.9558",
    location: "Coimbatore, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  },
  {
    id: 2,
    title: "Ocean View Resort",
    description: "Relaxing stay with beautiful ocean views.",
    price: 4500,
    latitude: "13.0827",
    longitude: "80.2707",
    location: "Chennai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  },
  {
    id: 3,
    title: "Royal Comfort Inn",
    description: "Affordable rooms for families and travelers.",
    price: 1800,
    latitude: "9.9252",
    longitude: "78.1198",
    location: "Madurai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
  },
  {
    id: 4,
    title: "Green Valley Resort",
    description: "Peaceful resort surrounded by nature.",
    price: 3500,
    latitude: "10.0889",
    longitude: "77.0595",
    location: "Munnar",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  },
  {
    id: 5,
    title: "City Lights Hotel",
    description: "Modern hotel close to shopping and transport.",
    price: 3000,
    latitude: "12.9716",
    longitude: "77.5946",
    location: "Bengaluru",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  },
  {
    id: 6,
    title: "Sunrise Residency",
    description: "A cozy stay for business and leisure trips.",
    price: 2200,
    latitude: "10.7905",
    longitude: "78.7047",
    location: "Tiruchirappalli, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
  },
];

function loadHotels() {
  try {
    const savedHotels = localStorage.getItem(STORAGE_KEY);

    if (savedHotels) {
      const parsedHotels = JSON.parse(savedHotels);
      if (Array.isArray(parsedHotels)) return parsedHotels;
    }
  } catch (error) {
    console.error("Unable to load hotels:", error);
  }

  return initialHotels;
}

function App() {
  const [hotels, setHotels] = useState(loadHotels);

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [viewHotel, setViewHotel] = useState(null);
  const [deleteHotel, setDeleteHotel] = useState(null);
  const [notification, setNotification] = useState("");

  // Save hotel details and uploaded image data.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    } catch (error) {
      console.error("Unable to save hotels:", error);
      setNotification(
        "Storage is full. Please upload a smaller image."
      );
    }
  }, [hotels]);

  useEffect(() => {
    if (!notification) return undefined;

    const timer = window.setTimeout(() => {
      setNotification("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const filteredHotels = useMemo(() => {
    let result = hotels.filter((hotel) => {
      const searchableText = [
        hotel.title,
        hotel.name,
        hotel.description,
        hotel.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        search.trim().toLowerCase()
      );

      const price = Number(hotel.price) || 0;

      const matchesMin =
        minPrice === "" || price >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || price <= Number(maxPrice);

      return matchesSearch && matchesMin && matchesMax;
    });

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.title || a.name || "").localeCompare(
          b.title || b.name || ""
        )
      );
    }

    return result;
  }, [hotels, search, minPrice, maxPrice, sortBy]);

  const totalPages = Math.ceil(
    filteredHotels.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const visibleHotels = filteredHotels.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Add a new hotel or update an existing one.
  const handleSaveHotel = (hotelData) => {
    const normalizedHotel = {
      ...hotelData,
      title: (
        hotelData.title ||
        hotelData.name ||
        editingHotel?.title ||
        editingHotel?.name ||
        ""
      ).trim(),
      description: (hotelData.description || "").trim(),
      location: (hotelData.location || "").trim(),
      price: Number(hotelData.price) || 0,
      rating:
        hotelData.rating === "" ||
        hotelData.rating === undefined
          ? 0
          : Number(hotelData.rating),
      image:
        hotelData.image ||
        editingHotel?.image ||
        "",
    };

    delete normalizedHotel.name;

    if (editingHotel) {
      setHotels((previousHotels) =>
        previousHotels.map((hotel) =>
          hotel.id === editingHotel.id
            ? {
                ...hotel,
                ...normalizedHotel,
                id: hotel.id,
              }
            : hotel
        )
      );

      setViewHotel((previousHotel) =>
        previousHotel?.id === editingHotel.id
          ? {
              ...previousHotel,
              ...normalizedHotel,
              id: editingHotel.id,
            }
          : previousHotel
      );

      setNotification("Hotel updated successfully!");
    } else {
      const newHotel = {
        ...normalizedHotel,
        id: Date.now(),
      };

      setHotels((previousHotels) => [
        newHotel,
        ...previousHotels,
      ]);

      setNotification("Hotel added successfully!");
      setCurrentPage(1);
    }

    setShowForm(false);
    setEditingHotel(null);
  };

  const openAddForm = () => {
    setEditingHotel(null);
    setShowForm(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setShowForm(true);
  };

  const handleDelete = (hotelId) => {
    const selectedHotel = hotels.find(
      (hotel) => hotel.id === hotelId
    );

    if (selectedHotel) {
      setDeleteHotel(selectedHotel);
    }
  };

  const confirmDelete = () => {
    if (!deleteHotel) return;

    setHotels((previousHotels) =>
      previousHotels.filter(
        (hotel) => hotel.id !== deleteHotel.id
      )
    );

    if (viewHotel?.id === deleteHotel.id) {
      setViewHotel(null);
    }

    setDeleteHotel(null);
    setNotification("Hotel deleted successfully!");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingHotel(null);
  };

  const resetFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("recommended");
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✦</span>
          HotelHub
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={openAddForm}
        >
          + Add Hotel
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">
            YOUR NEXT STAY STARTS HERE
          </p>

          <h1>Find Your Perfect Stay</h1>

          <p>
            Discover comfortable hotels and beautiful places
            for your next trip.
          </p>

          <div className="hero-search">
            <div className="hero-search-field destination-field">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search hotels or locations..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <div className="hero-price-field">
              <label htmlFor="heroMinPrice">Min Price</label>
              <div className="hero-price-input">
                <span>₹</span>
                <input
                  id="heroMinPrice"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="hero-price-field">
              <label htmlFor="heroMaxPrice">Max Price</label>
              <div className="hero-price-input">
                <span>₹</span>
                <input
                  id="heroMaxPrice"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="hero-search-btn"
              onClick={() => setCurrentPage(1)}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Hotel Section */}
      <main className="hotel-section">
        <aside className="filter-sidebar">
          <h2>Filters</h2>

          <div className="filter-group">
            <label htmlFor="minPrice">
              Minimum Price (₹)
            </label>
            <input
              id="minPrice"
              type="number"
              min="0"
              placeholder="Min price"
              value={minPrice}
              onChange={(event) => {
                setMinPrice(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">
              Maximum Price (₹)
            </label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              placeholder="Max price"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button
            type="button"
            className="reset-filter-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </aside>

        <section className="hotel-results">
          <div className="results-header">
            <div>
              <p className="section-eyebrow">
                EXPLORE OUR COLLECTION
              </p>

              <h2>Available Hotels</h2>

              <p>
                {filteredHotels.length}{" "}
                {filteredHotels.length === 1 ? "hotel" : "hotels"}{" "}
                found
              </p>
            </div>

            <div className="sort-control">
              <label htmlFor="sortBy">Sort by:</label>

              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {visibleHotels.length > 0 ? (
            <>
              <div className="hotel-grid">
                {visibleHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onView={() => setViewHotel(hotel)}
                    onEdit={() => handleEdit(hotel)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No hotels found</h3>
              <p>
                Try changing your search or adjusting the price
                filters.
              </p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <h3>HotelHub</h3>
        <p>Find your stay. Make your journey memorable.</p>
        <small>© {new Date().getFullYear()} HotelHub</small>
      </footer>

      {/* Add / Edit Hotel Form */}
      {showForm && (
        <HotelForm
          hotel={editingHotel}
          onSave={handleSaveHotel}
          onCancel={closeForm}
        />
      )}

      {/* View Hotel Details */}
      {viewHotel && (
        <div
          className="form-overlay"
          onClick={() => setViewHotel(null)}
        >
          <div
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close details"
              onClick={() => setViewHotel(null)}
            >
              ×
            </button>

            <img
              src={viewHotel.image}
              alt={viewHotel.title || "Hotel"}
              className="details-image"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
              }}
            />

            <div className="details-content">
              <h2>{viewHotel.title || viewHotel.name}</h2>
              <p>{viewHotel.description}</p>

              {viewHotel.location && (
                <p>
                  <strong>Location:</strong> {viewHotel.location}
                </p>
              )}

              {viewHotel.rating > 0 && (
                <p>
                  <strong>Rating:</strong> ⭐ {viewHotel.rating}/5
                </p>
              )}

              <p className="details-price">
                ₹{Number(viewHotel.price || 0).toLocaleString("en-IN")}
                <span> / night</span>
              </p>

              <button
                type="button"
                className="save-btn"
                onClick={() => setViewHotel(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteHotel && (
        <div
          className="form-overlay"
          onClick={() => setDeleteHotel(null)}
        >
          <div
            className="delete-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Delete Hotel?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteHotel.title || deleteHotel.name}</strong>?
            </p>

            <div className="popup-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeleteHotel(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="success-popup" role="status">
          ✓ {notification}
        </div>
      )}
    </div>
  );
}

export default App;