"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import ScrollingLane from "./ScrollingLane";

const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const LANE_SPACING = 30;
const BANNER_MARGIN = 360;

const USABLE_WIDTH = CONTAINER_WIDTH - BANNER_MARGIN * 2;
const LANE_WIDTH = CARD_WIDTH;
const NUM_LANES = Math.floor((USABLE_WIDTH + LANE_SPACING) / (LANE_WIDTH + LANE_SPACING));
const START_X = BANNER_MARGIN + (USABLE_WIDTH - (NUM_LANES * LANE_WIDTH + (NUM_LANES - 1) * LANE_SPACING)) / 2;

const getLaneX = (index) => START_X + index * (LANE_WIDTH + LANE_SPACING);

function shufflePosts(posts) {
  const array = posts.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const CardRain = ({ posts }) => {
  const postQueue = useRef([]);
  const seenPosts = useRef(new Set());
  const newPostIds = useRef(new Set());

  useEffect(() => {
    const newPosts = posts.filter(p => !seenPosts.current.has(p.id));
    newPosts.forEach(p => {
      seenPosts.current.add(p.id);
      newPostIds.current.add(p.id);
    });

    const allPosts = posts.slice();
    const newShuffled = shufflePosts(newPosts);
    const recycled = shufflePosts(allPosts.filter(p => !newPosts.includes(p)));

    postQueue.current = [...newShuffled, ...recycled];
  }, [posts]);

  const getNextPost = () => {
    const post = postQueue.current.shift();
    if (!post) return null;
    postQueue.current.push(post);
    return {
      ...post,
      isNew: newPostIds.current.delete(post.id)
    };
  };

  return (
    <Box
      sx={{
        position: "absolute",
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        top: 0,
        left: 0,
        zIndex: 2,
        pointerEvents: "none"
      }}
    >
      {Array.from({ length: NUM_LANES }, (_, i) => (
        <ScrollingLane
          key={i}
          x={getLaneX(i)}
          y={0}
          length={CONTAINER_HEIGHT}
          direction={i % 2 === 0 ? "up" : "down"}
          getNextPost={getNextPost}
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
        />
      ))}
    </Box>
  );
};

export default CardRain;
