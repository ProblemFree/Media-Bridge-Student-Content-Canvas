"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import PostCard from './PostCard';

const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const TOP_MARGIN = 20;
const BOTTOM_MARGIN = 20;
const DURATION = 30;
const NUM_LANES = 4;

const availableHeight = CONTAINER_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;
const laneHeight = availableHeight / NUM_LANES;
const lanePositions = Array.from({ length: NUM_LANES }, (_, i) => TOP_MARGIN + i * laneHeight);

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
  const laneNextSpawnRef = useRef(Array(NUM_LANES).fill(Date.now()));
  const postQueueRef = useRef([]);
  const seenPostIdsRef = useRef(new Set());

  // On post update, push only new unseen posts to the top of queue
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const newPosts = posts.filter(post => !seenPostIdsRef.current.has(post.id));
    newPosts.forEach(post => seenPostIdsRef.current.add(post.id));

    const recycled = posts.filter(post => seenPostIdsRef.current.has(post.id));
    postQueueRef.current = [...shufflePosts(newPosts), ...shufflePosts(recycled)];

  }, [posts]);

  const spawnCard = () => {
    const now = Date.now();
    const availableLanes = laneNextSpawnRef.current
      .map((time, idx) => (now >= time ? idx : null))
      .filter(idx => idx !== null);

    if (availableLanes.length === 0 || postQueueRef.current.length === 0) return;

    const nextPost = postQueueRef.current.shift(); // FIFO: spawn new or recycled post
    postQueueRef.current.push(nextPost); // recycle it back to the queue

    const randomLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

    setCards(prev => [
      ...prev,
      {
        post: nextPost,
        lane: randomLane,
        key: `${nextPost.id}-${Date.now()}-${Math.random()}`
      }
    ]);

    laneNextSpawnRef.current[randomLane] = now + clearanceDelay * 1000;
  };

  useEffect(() => {
    const interval = setInterval(spawnCard, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAnimationEnd = (key) => {
    setCards(prev => prev.filter(card => card.key !== key));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
    >
      {cards.map(card => (
        <div
          key={card.key}
          style={{
            position: 'absolute',
            top: lanePositions[card.lane],
            left: CONTAINER_WIDTH,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            animation: `moveLeft ${DURATION}s linear forwards`
          }}
          onAnimationEnd={() => handleAnimationEnd(card.key)}
        >
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
      `}</style>
    </Box>
  );
};

export default CardRain;
