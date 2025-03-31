"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CardRain from "@/components/CardRain";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function ContentClient() {
  const { user, isAdmin, loading } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const seenIds = useRef(new Set());

  const fetchAcceptedPosts = async () => {
    try {
      const res = await fetch("/api/acceptedPosts");
      const { posts: fetched } = await res.json();

      // Filter for unseen posts only
      const newPosts = fetched.filter((p) => !seenIds.current.has(p.id));
      newPosts.forEach((p) => seenIds.current.add(p.id));

      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAcceptedPosts();
      const interval = setInterval(fetchAcceptedPosts, 10000); // every 10 seconds
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

  return <CardRain posts={posts} />;
}
