"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CardRain from "@/components/CardRain";
import WaterScene from "@/components/WaterScene";
import SideBanner from "@/components/SideBanner";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function ContentClient() {
  const { user, isAdmin, loading } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const seenIds = useRef(new Set());

  const fetchAcceptedPosts = async () => {
    try {
      const res = await fetch("/api/acceptedPosts");
      const { posts: fetched } = await res.json();

      const newSeenIds = new Set(fetched.map(p => p.id));
      seenIds.current = newSeenIds;

      setPosts(fetched);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAcceptedPosts();
      const interval = setInterval(fetchAcceptedPosts, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h6">🔒 Admin access only</Typography>
        <Typography>Please log in with an authorized admin account.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "3072px",
        height: "1280px",
        overflow: "hidden",
      }}
    >
      <WaterScene />
      <CardRain posts={posts} />
      <SideBanner
        align="left"
        title="Submit Something!"
        message="Use this QR code to upload a post."
        qrUrl="https://your-submission-url.com"
      />
      <SideBanner
         align="right"
         title="Submit Something!"
         message="Use this QR code to upload a post."
         qrUrl="https://your-submission-url.com"
      />
    </Box>
  );
}
