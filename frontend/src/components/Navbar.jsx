import React, { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, Bookmark, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";

export const Navbar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "tv", label: "TV Shows" },
    { id: "movies", label: "Movies" },
    { id: "popular", label: "New & Popular" },
    { id: "my-list", label: "My List", badge: watchlist.length > 0 ? watchlist.length : null },
  ];

  return (
    <header
      className="navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s ease",
        backgroundColor: isScrolled || isMobileMenuOpen ? "rgba(20, 20, 20, 0.95)" : "transparent",
        backgroundImage: isScrolled
          ? "none"
          : "linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        padding: isScrolled ? "12px 4% " : "20px 4%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left: Brand and Navigation */}
      <div className="navbar__left">
        {/* Mobile menu toggle (hidden on desktop) */}
        <button
          className="navbar__menu-btn"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Netflix Logo */}
        <div
          onClick={() => {
            setActiveTab("home");
            setSearchQuery("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: "900",
            letterSpacing: "-0.5px",
            color: "var(--netflix-red)",
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          NETFLIX
        </div>

        {/* Desktop Navigation Links */}
        <nav className={`navbar__links ${isMobileMenuOpen ? "navbar__links--open" : ""}`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id && !searchQuery;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchQuery("");
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  background: "transparent",
                  color: isActive ? "#ffffff" : "var(--netflix-light-gray)",
                  fontWeight: isActive ? "700" : "400",
                  fontSize: "14px",
                  transition: "color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  position: "relative",
                  padding: "6px 0",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--netflix-light-gray)";
                }}
              >
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      background: "var(--netflix-red)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Notifications & Profile */}
      <div className="navbar__right">
        {/* Interactive Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: isSearchOpen ? "rgba(0, 0, 0, 0.8)" : "transparent",
            border: isSearchOpen ? "1px solid rgba(255, 255, 255, 0.6)" : "1px solid transparent",
            borderRadius: "4px",
            padding: "4px 8px",
            transition: "all 0.3s ease",
          }}
        >
          <Search
            size={18}
            style={{ cursor: "pointer", color: "#fff", flexShrink: 0 }}
            onClick={() => setIsSearchOpen((prev) => !prev)}
          />
          {isSearchOpen && (
            <input
              type="text"
              autoFocus
              className="navbar__search-input"
              placeholder="Search titles..."
              aria-label="Search titles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "13px",
                marginLeft: "8px",
                fontFamily: "inherit",
              }}
            />
          )}
          {isSearchOpen && searchQuery && (
            <X
              size={14}
              style={{ cursor: "pointer", color: "var(--netflix-gray)", marginLeft: "4px" }}
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>

        {/* Notifications Icon */}
        <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Bell size={18} style={{ color: "#fff" }} />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "6px",
              height: "6px",
              background: "var(--netflix-red)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* User Account or Sign In */}
        {user ? (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <img
                src={user.image || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
                alt={user.username}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
              />
              <ChevronDown
                size={14}
                style={{
                  color: "#fff",
                  transform: isProfileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: 0,
                  width: "210px",
                  background: "rgba(18, 18, 18, 0.98)",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8)",
                  padding: "10px 0",
                  zIndex: 100,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ padding: "8px 16px", borderBottom: "1px solid #2a2a2a" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{user.username}</div>
                  <div style={{ fontSize: "11px", color: "var(--netflix-gray)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveTab("my-list");
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--netflix-light-gray)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#262626")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Bookmark size={15} />
                  My List ({watchlist.length})
                </div>

                <div
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "#ff5252",
                    borderTop: "1px solid #2a2a2a",
                    marginTop: "6px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#262626")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <LogOut size={15} />
                  Sign Out of Netflix
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: "var(--netflix-red)",
              color: "#fff",
              whiteSpace: "nowrap",
              padding: "6px 14px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--netflix-red-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--netflix-red)")}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
