
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { auth, db } from "./firebase.jsx";
import "../styles/wardrobeAnalytics.css";

// =====================================
// COUNT CLOTHING BY ATTRIBUTE
// =====================================

const countBy = (items, field) => {
  const counts = {};

  items.forEach((item) => {
    const value = item[field];

    if (!value) return;

    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);
};

// =====================================
// BAR CHART COMPONENT
// =====================================

function BarChart({ title, data }) {
  const max = Math.max(
    1,
    ...data.map((item) => item.count)
  );

  return (
    <div
      className="analytics-chart"
      style={{
        backgroundColor: "#f5efe3",
        border: "1px solid #4f5b2a",
        borderRadius: "6px",
        padding: "30px",
        minHeight: "220px",
        minWidth: 0
      }}
    >
      <h2
        style={{
          color: "#4f5b2a",
          fontFamily: "Georgia, serif",
          fontSize: "25px",
          fontWeight: 500,
          margin: "0 0 30px"
        }}
      >
        {title}
      </h2>

      {data.length === 0 ? (
        <p>No data yet.</p>
      ) : (
        data.map((item) => (
          <div
            className="analytics-bar-row"
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns:
                "90px minmax(0, 1fr) 30px",
              alignItems: "center",
              gap: "14px",
              marginBottom: "18px",
              fontSize: "14px",
              color: "#4f5b2a"
            }}
          >
            <span style={{ overflowWrap: "anywhere" }}>
              {item.name}
            </span>

            <div
              className="analytics-bar-track"
              style={{
                height: "13px",
                backgroundColor: "#ddd9c9",
                borderRadius: "20px",
                overflow: "hidden"
              }}
            >
              <div
                className="analytics-bar-fill"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  height: "100%",
                  backgroundColor: "#4f5b2a",
                  borderRadius: "20px"
                }}
              />
            </div>

            <strong style={{ textAlign: "right" }}>
              {item.count}
            </strong>
          </div>
        ))
      )}
    </div>
  );
}

// =====================================
// MAIN ANALYTICS PAGE
// =====================================

export default function WardrobeAnalytics() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // LOAD CLOTHING FROM FIREBASE
  // =====================================

  useEffect(() => {
    let unsubscribeItems = () => {};

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeItems();
        unsubscribeItems = () => {};

        setClothes([]);
        setError("");

        if (!user) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const clothingQuery = query(
          collection(db, "clothingItems"),
          where("userId", "==", user.uid)
        );

        unsubscribeItems = onSnapshot(
          clothingQuery,
          (snapshot) => {
            const items = snapshot.docs.map(
              (document) => ({
                id: document.id,
                ...document.data()
              })
            );

            setClothes(items);
            setLoading(false);
          },
          (err) => {
            console.error("Analytics error:", err);
            setError(
              "Unable to load wardrobe analytics."
            );
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeItems();
    };
  }, []);

  // =====================================
  // CALCULATE STATISTICS
  // =====================================

  const categories = countBy(clothes, "category");
  const colors = countBy(clothes, "color");
  const seasons = countBy(clothes, "season");
  const patterns = countBy(clothes, "pattern");

  const mostCommonColor = colors[0]?.name || "None";

  const stats = [
    {
      label: "Total Clothing",
      value: clothes.length
    },
    {
      label: "Categories",
      value: categories.length
    },
    {
      label: "Unique Colors",
      value: colors.length
    },
    {
      label: "Most Common Color",
      value: mostCommonColor
    }
  ];

  // =====================================
  // PAGE STYLING
  // =====================================

  const pageStyle = {
    width: "100%",
    minHeight: "100vh",
    padding: "125px 7% 80px",
    backgroundColor: "#ead1bb",
    color: "#4f5b2a",
    fontFamily: 'Georgia, "Times New Roman", serif',
    textAlign: "left",
    boxSizing: "border-box"
  };

  const navbarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    width: "100%",
    height: "80px",
    padding: "0 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5efe3",
    boxSizing: "border-box"
  };

  const statCardStyle = {
    minHeight: "160px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "20px",
    backgroundColor: "#f5efe3",
    border: "1px solid #4f5b2a",
    borderRadius: "6px",
    boxSizing: "border-box"
  };

  // =====================================
  // RENDER PAGE
  // =====================================

  return (
    <div
      className="analytics-page"
      style={pageStyle}
    >

      {/* NAVBAR */}

      <header
        className="analytics-navbar"
        style={navbarStyle}
      >
        <Link
          to="/"
          className="analytics-logo"
          style={{
            color: "#4f5b2a",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Georgia, serif",
            textDecoration: "none"
          }}
        >
          Rewear
        </Link>

        <Link
          to="/wardrobe"
          className="analytics-nav-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 22px",
            backgroundColor: "#4f5b2a",
            color: "#f5efe3",
            borderRadius: "5px",
            fontSize: "17px",
            fontFamily: "Georgia, serif",
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}
        >
          My Wardrobe
        </Link>
      </header>

      {/* PAGE HEADING */}

      <div
        className="analytics-heading"
        style={{
          marginBottom: "40px"
        }}
      >
        <h1
          style={{
            color: "#4f5b2a",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(36px, 4vw, 52px)",
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "normal",
            margin: "0 0 12px"
          }}
        >
          Wardrobe Insights
        </h1>

        <p
          style={{
            color: "#6c6c5a",
            fontSize: "17px"
          }}
        >
          Discover what's inside your wardrobe.
        </p>
      </div>

      {/* LOADING / ERROR */}

      {loading ? (
        <p>Loading analytics...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>

          {/* STATISTICS CARDS */}

          <div
            className="analytics-stats"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "20px",
              marginBottom: "35px"
            }}
          >
            {stats.map((stat) => (
              <div
                className="analytics-stat-card"
                key={stat.label}
                style={statCardStyle}
              >
                <span
                  style={{
                    color: "#6c6c5a",
                    fontSize: "15px"
                  }}
                >
                  {stat.label}
                </span>

                <strong
                  style={{
                    color: "#4f5b2a",
                    fontSize: "32px",
                    fontWeight: 600,
                    overflowWrap: "anywhere"
                  }}
                >
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>

          {/* CHARTS */}

          {clothes.length === 0 ? (
            <div
              className="analytics-empty"
              style={{
                padding: "30px",
                backgroundColor: "#f5efe3",
                border: "1px solid #4f5b2a",
                borderRadius: "6px"
              }}
            >
              Your wardrobe is empty.
              Add clothing to see your insights!
            </div>
          ) : (
            <div
              className="analytics-charts"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
                gap: "24px"
              }}
            >
              <BarChart
                title="Clothing by Category"
                data={categories}
              />

              <BarChart
                title="Color Distribution"
                data={colors}
              />

              <BarChart
                title="Seasonal Distribution"
                data={seasons}
              />

              <BarChart
                title="Pattern Distribution"
                data={patterns}
              />
            </div>
          )}

        </>
      )}
    </div>
  );
}
