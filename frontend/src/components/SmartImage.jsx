import React, { useState } from "react";
import { Film } from "lucide-react";

/**
 * Image with a loading skeleton and an honest fallback.
 * Tries `src`, then `fallbackSrc`; if neither exists or both fail to load it shows
 * a neutral placeholder with the title instead of an unrelated stock picture.
 */
const SmartImageInner = ({ src, fallbackSrc, alt, onClick, eager = false }) => {
  const sources = [src, fallbackSrc].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const current = sources[index];

  if (!current) {
    return (
      <div className="smart-image" onClick={onClick}>
        <div className="img-placeholder" role="img" aria-label={`${alt} (no image available)`}>
          <Film size={26} />
          <span>{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-image" onClick={onClick}>
      {!loaded && <div className="skeleton" />}
      <img
        src={current}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={loaded ? "is-loaded" : ""}
        // Cached images can finish before React attaches onLoad
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
};

// Remount when the sources change so the loading/error state starts fresh.
export const SmartImage = (props) => <SmartImageInner key={`${props.src}|${props.fallbackSrc}`} {...props} />;
