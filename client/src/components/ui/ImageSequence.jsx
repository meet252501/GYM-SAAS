import { useState, useEffect } from 'react';

/**
 * ImageSequence Component
 * Reliable alternative to GIFs. Toggles between frames to create animation.
 * Sourced from stable GitHub image database.
 */
export default function ImageSequence({ path, interval = 800, className, style }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const imageUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${path}/${frame}.jpg`;

  return (
    <img 
      src={imageUrl} 
      alt="Exercise animation" 
      className={className} 
      style={{ 
        ...style, 
        objectFit: 'contain',
        transition: 'opacity 0.2s ease-in-out'
      }} 
      onError={(e) => {
        // Fallback to frame 0 if frame 1 doesn't exist
        if (frame === 1) setFrame(0);
        e.target.src = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${path}/0.jpg`;
      }}
    />
  );
}
