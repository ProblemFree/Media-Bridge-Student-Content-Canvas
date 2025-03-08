"use client";
import React, { useState, useEffect } from 'react';
import { collection, db, query, where, onSnapshot } from '/lib/firebaseConfig';
import { Container, Grid2, Typography} from '@mui/material';
import PostCard from '/src/components/PostCard';

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
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Stream
      </Typography>
      <Grid2 container spacing={2}>
        {contentItems.map(item => (
          <Grid2 item key={item.id}>
            <PostCard 
              fileUrl={item.fileUrl} 
              message={item.message} 
              userId={item.userId}
              fileName={item.fileName}
            />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default ContentStream;