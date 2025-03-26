import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import PostCard from './PostCard';

// Display and card dimensions/constants
const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const TOP_MARGIN = 20;
const BOTTOM_MARGIN = 20;
const DURATION = 30; // seconds for a card to traverse the screen

// Number of vertical lanes
const NUM_LANES = 4;
// Calculate lane vertical positions so that cards remain fully visible within TOP and BOTTOM margins.
const availableHeight = CONTAINER_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;
const laneHeight = availableHeight / NUM_LANES;
const lanePositions = Array.from({ length: NUM_LANES }, (_, i) => TOP_MARGIN + i * laneHeight);

// Clearance delay: the time it takes for a card to move 1.5x its width (to ensure better spacing).
const clearanceDelay = (CARD_WIDTH * 1.5 / (CONTAINER_WIDTH + CARD_WIDTH)) * DURATION;

const CardRain = ({ posts }) => {
  const [cards, setCards] = useState([]);
  const laneNextSpawnRef = useRef(Array(NUM_LANES).fill(Date.now()));
  const postIndexRef = useRef(0);

  // Helper function to retrieve the next post in round-robin order.
  const getNextPost = () => {
    if (!posts || posts.length === 0) return null;
    const post = posts[postIndexRef.current % posts.length];
    postIndexRef.current += 1;
    return post;
  };

  // Spawn a new card in a random available lane.
  const spawnCard = () => {
    const now = Date.now();
    const availableLanes = laneNextSpawnRef.current
      .map((nextSpawnTime, index) => (now >= nextSpawnTime ? index : null))
      .filter(index => index !== null);
    
    if (availableLanes.length > 0) {
      const randomLane =
        availableLanes[Math.floor(Math.random() * availableLanes.length)];

      const newPost = getNextPost();
      if (!newPost) return;

      setCards(prevCards => [
        ...prevCards,
        {
          post: newPost,
          lane: randomLane,
          key: `${newPost.id}-${Date.now()}-${Math.random()}`
        }
      ]);

      laneNextSpawnRef.current[randomLane] = now + clearanceDelay * 1000;
    }
  };

  // Set up an interval to continuously attempt spawning a single new post at a time.
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const interval = setInterval(spawnCard, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [posts]);

  // When a card finishes its animation, remove it from the state.
  const handleAnimationEnd = (key) => {
    setCards(prevCards => prevCards.filter(card => card.key !== key));
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
            left: CONTAINER_WIDTH, // Start at right edge
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
            userID={card.post.userID}
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
