"use client";
import React, { useState, useEffect } from 'react';
import { collection, db, query, where, onSnapshot } from '/lib/firebaseConfig';
import { Container, Grid2, Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';

const ContentStream = () => {
  const [contentItems, setContentItems] = useState([]);

  useEffect(() => {
    // Create a Firestore query for submissions where "accepted" is true
    const submissionsRef = collection(db, 'uploads');
    const acceptedQuery = query(submissionsRef, where('accepted', '==', false));

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
    <Container style={{display: "flex"}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Stream
      </Typography>
        {contentItems.map(item => (
          <Card key={item.id} sx={{ flexBasis: "24%", maxWidth: 350, height: 350, marginBottom: 2}}>
            <CardMedia 
              sx={{ objectFit: "contain" }} height="250">
              {item.fileUrl && (
                <img 
                  src={item.fileUrl} 
                  alt={item.fileName || 'Uploaded content'}
                />
              )}
            </CardMedia>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {item.message}
              </Typography>
            </CardContent>
          </Card>
        ))}
    </Container>
  );
};

export default ContentStream;