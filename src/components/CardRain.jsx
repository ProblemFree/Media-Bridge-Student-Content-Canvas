import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PostCard from './PostCard';

// Constants for display dimensions and card size
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const TOP_MARGIN = 20;
const BOTTOM_MARGIN = 20;

// Duration range (in seconds) for card movement
const MIN_DURATION = 25; // Faster movement
const MAX_DURATION = 35;

// Number of cards to start at once (increase for denser rain)
const INITIAL_BATCH_SIZE = 4;

// Time interval to introduce new cards (in milliseconds)
const NEW_CARD_INTERVAL = 12000; // Every x miliseconds

/**
 * Generate random style properties for a card:
 * - top: random vertical position within the available space (accounting for margins).
 * - duration: random movement speed.
 */
const generateRandomStyle = () => {
  const minTop = TOP_MARGIN;
  const maxTop = CONTAINER_HEIGHT - CARD_WIDTH - BOTTOM_MARGIN; // Adjust for rotation
  const top = Math.random() * (maxTop - minTop) + minTop;
  const duration = Math.random() * (MAX_DURATION - MIN_DURATION) + MIN_DURATION;
  return { top, duration };
};

const CardRain = ({ posts }) => {
  const [queue, setQueue] = useState([]);

  // Initialize the queue when posts are received/changed.
  useEffect(() => {
    if (posts && posts.length > 0) {
      const initialQueue = posts.slice(0, INITIAL_BATCH_SIZE).map(post => ({
        post,
        ...generateRandomStyle(),
        key: `${post.id}-${Date.now()}`
      }));
      setQueue(initialQueue);
    }
  }, [posts]);

  // Function to introduce new cards at regular intervals
  useEffect(() => {
    if (!posts.length) return;

    const interval = setInterval(() => {
      setQueue(prevQueue => {
        const nextIndex = prevQueue.length % posts.length;
        const newPost = posts[nextIndex];

        if (!newPost) return prevQueue;

        const newCard = {
          post: newPost,
          ...generateRandomStyle(),
          key: `${newPost.id}-${Date.now()}`
        };

        return [...prevQueue, newCard];
      });
    }, NEW_CARD_INTERVAL);

    return () => clearInterval(interval);
  }, [posts]);

  // Handle card exit: recycle and reintroduce it with new properties
  const handleAnimationEnd = (cardIndex) => {
    setQueue(prevQueue => {
      const cardToRecycle = prevQueue[cardIndex];
      const newQueue = prevQueue.filter((_, idx) => idx !== cardIndex);
      const recycledCard = {
        ...cardToRecycle,
        ...generateRandomStyle(),
        key: `${cardToRecycle.post.id}-${Date.now()}`
      };
      return [...newQueue, recycledCard];
    });
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
      {queue.map((card, index) => (
        <div
          key={card.key}
          style={{
            position: 'absolute',
            top: card.top,
            left: CONTAINER_WIDTH, // Start off-screen at the right edge
            width: CARD_HEIGHT, // Because it's rotated, use height for width
            height: CARD_WIDTH,
            transform: `rotate(90deg)`, // Rotate the card so the bottom edge leads
            transformOrigin: `50% 50%`, // Ensure it rotates around its center
            animation: `moveLeft ${card.duration}s linear forwards`
          }}
          onAnimationEnd={() => handleAnimationEnd(index)}
        >
          <PostCard 
            fileUrl={card.post.fileUrl}
            message={card.post.message}
            userId={card.post.userId}
            fileName={card.post.fileName}
          />
        </div>
      ))}

      {/* Keyframes for moving left (with rotation applied) */}
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
