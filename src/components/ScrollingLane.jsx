// ScrollingLane.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import PostCard from "./PostCard";

const ScrollingLane = ({
  x = 0,
  y = 0,
  length = 1280,
  direction = "up", // "down", "left", "right"
  getNextPost,
  cardWidth = 350,
  cardHeight = 350,
  spacing = 15,
}) => {
  const [cards, setCards] = useState([]);
  const timer = useRef(null);
  const laneRef = useRef();

  const animationDuration = 30; // seconds

  useEffect(() => {
    timer.current = setInterval(() => {
      const post = getNextPost?.();
      if (post) {
        const key = `${post.id}-${Date.now()}`;
        setCards((prev) => [...prev, { key, post }]);
      }
    }, 2000);

    return () => clearInterval(timer.current);
  }, [getNextPost]);

  const handleAnimationEnd = (key) => {
    setCards((prev) => prev.filter((c) => c.key !== key));
  };

  const isVertical = direction === "up" || direction === "down";
  const reverse = direction === "down" || direction === "right";

  return (
    <div
      ref={laneRef}
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: isVertical ? `${cardWidth}px` : `${length}px`,
        height: isVertical ? `${length}px` : `${cardHeight}px`,
        overflow: "hidden",
        transform: reverse ? "rotate(180deg)" : "none",
        pointerEvents: "none",
      }}
    >
      {cards.map(({ key, post }) => (
        <div
          key={key}
          style={{
            position: "absolute",
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            animation: `scroll-${direction} ${animationDuration}s linear forwards`,
          }}
          onAnimationEnd={() => handleAnimationEnd(key)}
        >
          <div
            style={{
              transform: reverse ? "rotate(180deg)" : "none",
            }}
          >
            <PostCard
              fileUrl={post.fileUrl}
              message={post.message}
              userId={post.userId}
              fileName={post.fileName}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes scroll-up {
          from {
            transform: translateY(${length}px);
          }
          to {
            transform: translateY(-${cardHeight + spacing}px);
          }
        }

        @keyframes scroll-down {
          from {
            transform: translateY(-${cardHeight + spacing}px);
          }
          to {
            transform: translateY(${length}px);
          }
        }

        @keyframes scroll-left {
          from {
            transform: translateX(${length}px);
          }
          to {
            transform: translateX(-${cardWidth + spacing}px);
          }
        }

        @keyframes scroll-right {
          from {
            transform: translateX(-${cardWidth + spacing}px);
          }
          to {
            transform: translateX(${length}px);
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingLane;
