"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import PostCard from "./PostCard";

const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const NUM_LANES = 3;
const DURATION = 30; // seconds

const LANE_HEIGHT = CONTAINER_HEIGHT / NUM_LANES;
const LANE_POSITIONS = Array.from({ length: NUM_LANES }, (_, i) => i * LANE_HEIGHT);

const clearanceDelay = (CARD_WIDTH * 1.5 / (CONTAINER_WIDTH + CARD_WIDTH)) * DURATION;

function shufflePosts(posts) {
  const array = posts.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const CardRain = ({ posts }) => {
  const [cards, setCards] = useState([]);
  const laneTimers = useRef(Array(NUM_LANES).fill(Date.now()));
  const postQueue = useRef([]);
  const seenPosts = useRef(new Set());

  // Track which posts have already appeared for glow logic
  const newPostIds = useRef(new Set());

  // Sync post queue on props update
  useEffect(() => {
    const newPosts = posts.filter(p => !seenPosts.current.has(p.id));
    newPosts.forEach(p => seenPosts.current.add(p.id));
    newPosts.forEach(p => newPostIds.current.add(p.id));

    // Always update queue to reflect current accepted set
    const allPosts = posts.slice();
    const newShuffled = shufflePosts(newPosts);
    const recycled = shufflePosts(allPosts.filter(p => !newPosts.includes(p)));

    postQueue.current = [...newShuffled, ...recycled];
  }, [posts]);

  // Card spawner
  const spawnCard = () => {
    const now = Date.now();
    const availableLanes = laneTimers.current
      .map((time, index) => (now >= time ? index : null))
      .filter(index => index !== null);

    if (availableLanes.length === 0 || postQueue.current.length === 0) return;

    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const post = postQueue.current.shift();
    postQueue.current.push(post); // recycle

    const isNew = newPostIds.current.has(post.id);
    if (isNew) newPostIds.current.delete(post.id);

    setCards(prev => [
      ...prev,
      {
        key: `${post.id}-${Date.now()}`,
        post,
        lane,
        isNew
      }
    ]);

    laneTimers.current[lane] = now + clearanceDelay * 1000;
  };

  // Cleanup expired cards
  const handleAnimationEnd = key => {
    setCards(prev => prev.filter(c => c.key !== key));
  };

  useEffect(() => {
    const interval = setInterval(spawnCard, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        top: 0,
        left: 0,
        zIndex: 2, // above water, below banners
        pointerEvents: "none"
      }}
    >
      {cards.map(card => (
        <div
          key={card.key}
          style={{
            position: "absolute",
            top: LANE_POSITIONS[card.lane],
            left: CONTAINER_WIDTH,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            animation: `moveLeft ${DURATION}s linear forwards`,
            zIndex: card.isNew ? 3 : 2
          }}
          onAnimationEnd={() => handleAnimationEnd(card.key)}
        >
          {card.isNew && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "16px",
                boxShadow: "0 0 16px 4px rgba(255, 215, 0, 0.6)",
                animation: "glow 1.5s ease-in-out infinite alternate",
                zIndex: 1
              }}
            />
          )}
          <PostCard
            fileUrl={card.post.fileUrl}
            message={card.post.message}
            userId={card.post.userId}
            fileName={card.post.fileName}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes moveLeft {
          from {
            transform: translateX(0) rotate(-90deg);
          }
          to {
            transform: translateX(-${CONTAINER_WIDTH + CARD_HEIGHT}px) rotate(-90deg);
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 16px 4px rgba(255, 215, 0, 0.4);
          }
          100% {
            box-shadow: 0 0 24px 6px rgba(255, 215, 0, 0.8);
          }
        }
      `}</style>
    </Box>
  );
};

export default CardRain;
