"use client";
import React, { useState, useEffect } from 'react';
import { collection, db, query, where, onSnapshot } from '/lib/firebaseConfig';
import { Container, Grid2, Typography} from '@mui/material';
import CardRain from '/src/components/CardRain';

const ContentStream = () => {
  const [contentItems, setContentItems] = useState([]);

  useEffect(() => {
    // Create a Firestore query for submissions where "accepted" is true
    const submissionsRef = collection(db, 'uploads');
    const acceptedQuery = query(submissionsRef, where('accepted', '==', true));

    // Set up a real-time listener for the query
    const unsubscribe = onSnapshot(
      acceptedQuery,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        // Optionally, sort items by timestamp (newest first)
        items.sort((a, b) => b.timestamp - a.timestamp);
        setContentItems(items);
      },
      (error) => {
        console.error("Error fetching content:", error);
      }
    );

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  
  return (
    <Container maxWidth={false} disableGutters>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        gutterBottom 
        sx={{ marginTop: '20px' }}
      >
        Content Stream
      </Typography>

      {/* CardRain component for continuous card rain effect */}
      <CardRain posts={contentItems} />
    </Container>
  );
};

export default ContentStream;