import React from "react";

export const Footer = () => {
  const links = [
    "FAQ",
    "Help Center",
    "Account",
    "Media Center",
    "Investor Relations",
    "Jobs",
    "Ways to Watch",
    "Terms of Use",
    "Privacy",
    "Cookie Preferences",
    "Corporate Information",
    "Contact Us",
    "Speed Test",
    "Legal Notices",
    "Only on Netflix",
  ];

  return (
    <footer
      style={{
        maxWidth: "1000px",
        margin: "60px auto 0",
        padding: "40px 4% 60px",
        color: "#808080",
        fontSize: "13px",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        Questions? Call <span style={{ textDecoration: "underline", cursor: "pointer" }}>1-800-012-3456</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px 20px",
          marginBottom: "28px",
        }}
      >
        {links.map((link) => (
          <a
            key={link}
            href="#"
            style={{ color: "#808080", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b3b3b3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#808080")}
            onClick={(e) => e.preventDefault()}
          >
            {link}
          </a>
        ))}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            background: "transparent",
            border: "1px solid #555",
            color: "#808080",
            padding: "6px 14px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Service Code
        </button>
      </div>

      <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px", lineHeight: 1.5 }}>
        Movie data and images are provided by{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB. Full-length films are public-domain
        or Creative Commons titles streamed from the{" "}
        <a href="https://archive.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
          Internet Archive
        </a>
        .
      </div>

      <div style={{ fontSize: "11px", color: "#666" }}>
        © 2026 Netflix Clone by Manel. Built with React & Node.js.
      </div>
    </footer>
  );
};
