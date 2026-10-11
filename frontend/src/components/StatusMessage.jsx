import React from "react";
import { AlertTriangle } from "lucide-react";

/** Centered error or empty-state block with an optional action button. */
export const StatusMessage = ({ icon, title, message, actionLabel, onAction, compact = false }) => (
  <div className={`status-message ${compact ? "status-message--compact" : ""}`} role="status">
    {icon || <AlertTriangle size={compact ? 22 : 40} />}
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {actionLabel && onAction && (
      <button className="btn btn--primary" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);
