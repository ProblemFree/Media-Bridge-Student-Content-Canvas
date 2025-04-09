"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Slider, Typography } from "@mui/material";
import ScrollingLane from "./ScrollingLane";

const CONTAINER_WIDTH = 3072;
const CONTAINER_HEIGHT = 1280;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const LANE_SPACING = 30;
const BANNER_MARGIN = 360;
const DEBUG = false;

const USABLE_WIDTH = CONTAINER_WIDTH - 2 * BANNER_MARGIN;
const NUM_LANES = Math.floor((USABLE_WIDTH + LANE_SPACING) / (CARD_WIDTH + LANE_SPACING));
const TOTAL_LANE_WIDTH = NUM_LANES * CARD_WIDTH + (NUM_LANES - 1) * LANE_SPACING;
const START_X = BANNER_MARGIN + (USABLE_WIDTH - TOTAL_LANE_WIDTH) / 2;

function shufflePosts(posts) {
  const array = posts.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const CardRain = () => {
  const [scrollDuration, setScrollDuration] = useState(20);
  const [spawnInterval, setSpawnInterval] = useState(3000);
  const [showControls, setShowControls] = useState(false);

  const postQueue = useRef([]);
  const seenPosts = useRef(new Set());
  const newPostIds = useRef(new Set());
  const latestAccepted = useRef([]);

  const hydrateQueue = () => {
    const newPosts = latestAccepted.current.filter(p => !seenPosts.current.has(p.id));
    newPosts.forEach(p => {
      seenPosts.current.add(p.id);
      newPostIds.current.add(p.id);
    });

    const allPosts = latestAccepted.current.slice();
    const newShuffled = shufflePosts(newPosts);
    const recycled = shufflePosts(allPosts.filter(p => !newPosts.includes(p)));

    postQueue.current = [...newShuffled, ...recycled];
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/getAcceptedPosts");
        const data = await res.json();
        if (Array.isArray(data)) {
          latestAccepted.current = data;
          hydrateQueue();
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts(); // Initial load
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  const getNextPost = () => {
    const post = postQueue.current.shift();
    if (!post) return null;
    postQueue.current.push(post);
    return {
      ...post,
      isNew: newPostIds.current.delete(post.id)
    };
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "~") setShowControls(prev => !prev);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
          x={START_X + i * (CARD_WIDTH + LANE_SPACING)}
          y={0}
          length={CONTAINER_HEIGHT}
          direction={i % 2 === 0 ? "up" : "down"}
          getNextPost={getNextPost}
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
          scrollDuration={scrollDuration}
          spawnInterval={spawnInterval}
          debug={DEBUG}
        />
      ))}

      {showControls && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            padding: 2,
            borderRadius: 2,
            color: "white",
            pointerEvents: "auto"
          }}
        >
          <Typography variant="h6">Live Controls</Typography>
          <Typography variant="body2">Scroll Speed (sec): {scrollDuration}</Typography>
          <Slider
            min={5}
            max={60}
            step={1}
            value={scrollDuration}
            onChange={(e, val) => setScrollDuration(val)}
          />
          <Typography variant="body2">Spawn Interval (ms): {spawnInterval}</Typography>
          <Slider
            min={500}
            max={10000}
            step={100}
            value={spawnInterval}
            onChange={(e, val) => setSpawnInterval(val)}
          />
        </Box>
      )}
    </Box>
  );
};

export default CardRain;