"use client";
import React, { useState, useEffect } from 'react';
import { collection, db, query, where, onSnapshot } from '/lib/firebaseConfig';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
import CardRain from '/src/components/CardRain';
import useAdminAuth from "@/hooks/useAdminAuth";

const ContentStream = () => {
  const [contentItems, setContentItems] = useState([]);
  const { user, isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!isAdmin) return;

    const submissionsRef = collection(db, 'uploads');
    const acceptedQuery = query(submissionsRef, where('accepted', '==', true));

    const unsubscribe = onSnapshot(
      acceptedQuery,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        items.sort((a, b) => b.timestamp - a.timestamp);
        setContentItems(items);
      },
      (error) => {
        console.error("Error fetching content:", error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6">🔒 Admin access only</Typography>
        <Typography>Please log in with an authorized admin account.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        gutterBottom 
        sx={{ marginTop: '20px' }}
      >
        Content Stream
      </Typography>

      <CardRain posts={contentItems} />
    </Container>
  );
};

export default ContentStream;
