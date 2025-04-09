
"use client";

import React, { useEffect, useState, useRef } from "react";
import PostCard from "./PostCard";

const CARD_SPACING = 12;

const ScrollingLane = ({
  x,
  y,
  length,
  direction = "up",
  getNextPost,
  cardWidth,
  cardHeight,
  scrollDuration = 20,
  spawnInterval = 3000,
  debug = false
}) => {
  const [cards, setCards] = useState([]);
  const cardId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const post = getNextPost();
      if (!post) return;

      const id = cardId.current++;
      setCards((prev) => [...prev, { id, post }]);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [getNextPost, spawnInterval]);

  const handleAnimationEnd = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const isVertical = direction === "up" || direction === "down";
  const scrollKey = `scroll-${direction}`;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: isVertical ? cardWidth : length,
        height: isVertical ? length : cardHeight,
        overflow: "hidden",
        outline: debug ? "1px solid red" : "none"
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            position: "absolute",
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            top: direction === "down" ? -cardHeight : undefined,
            bottom: direction === "up" ? -cardHeight : undefined,
            left: direction === "right" ? -cardWidth : undefined,
            right: direction === "left" ? -cardWidth : undefined,
            animation: `${scrollKey} ${scrollDuration}s linear forwards`,
            outline: debug ? "1px dashed lime" : "none"
          }}
          onAnimationEnd={() => handleAnimationEnd(card.id)}
        >
          <div
            style={{
              transform:
                direction === "down" || direction === "left"
                  ? "rotate(180deg)"
                  : "none"
            }}
          >
            <PostCard
              fileUrl={card.post.fileUrl}
              message={card.post.message}
              userId={card.post.userId}
              fileName={card.post.fileName}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes scroll-up {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-${length + cardHeight}px);
          }
        }

        @keyframes scroll-down {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(${length + cardHeight}px);
          }
        }

        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-${length + cardWidth}px);
          }
        }

        @keyframes scroll-right {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(${length + cardWidth}px);
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingLane;
