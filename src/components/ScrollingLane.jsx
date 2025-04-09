"use client";

import React, { useEffect, useState, useRef } from "react";
import PostCard from "./PostCard";

const SPAWN_INTERVAL = 3000; // ms
const SCROLL_DURATION = 20; // seconds
const CARD_SPACING = 12;

const ScrollingLane = ({ x, y, length, direction = "up", getNextPost, cardWidth, cardHeight }) => {
  const [cards, setCards] = useState([]);
  const cardId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const post = getNextPost();
      if (!post) return;

      const id = cardId.current++;
      setCards(prev => [...prev, { id, post }]);

      setTimeout(() => {
        setCards(prev => prev.filter(c => c.id !== id));
      }, SCROLL_DURATION * 1000);
    }, SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [getNextPost]);

  const isVertical = direction === "up" || direction === "down";
  const translateFrom = direction === "up" || direction === "left" ? 100 : -100;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: isVertical ? `${cardWidth}px` : `${length}px`,
        height: isVertical ? `${length}px` : `${cardHeight}px`,
        overflow: "hidden"
      }}
    >
      {cards.map(card => (
        <div
          key={card.id}
          style={{
            position: "absolute",
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            animation: `scroll-${direction} ${SCROLL_DURATION}s linear forwards`,
            top: direction === "down" ? `-${cardHeight}px` : undefined,
            bottom: direction === "up" ? `-${cardHeight}px` : undefined,
            left: direction === "right" ? `-${cardWidth}px` : undefined,
            right: direction === "left" ? `-${cardWidth}px` : undefined
          }}
        >
          <div
            style={{
              transform: direction === "down" || direction === "left" ? "rotate(180deg)" : "none"
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
            transform: translateY(100%);
          }
          to {
            transform: translateY(-100%);
          }
        }

        @keyframes scroll-down {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(100%);
          }
        }

        @keyframes scroll-left {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(-100%);
          }
        }

        @keyframes scroll-right {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingLane;
