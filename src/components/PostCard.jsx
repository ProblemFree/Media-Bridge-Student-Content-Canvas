// PostCard.jsx
// Renders a card (350x350 pixels) with:
// - A header at the top-left that says "userID says..."
// - An image (from fileUrl) that fills the top 70% of the card, scaled proportionally without cropping.
// - A message in the bottom 30% that auto-scales its font size to fit the container.

import React from 'react';
import { Card, CardHeader, Box } from '@mui/material';
import AutoScaleText from './AutoScaleText';

const PostCard = ({ fileUrl, message, userId, fileName }) => {
  return (
    <Card sx={{ width: 350, height: 350, position: 'relative' }}>
      {/* Header displaying the userID */}
      <CardHeader 
        title={`${userId} says...`}
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          padding: '4px 8px', 
          zIndex: 1 
        }}
      />
      
      {/* Image container: occupies the top 70% */}
      <Box 
        sx={{
          height: '70%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mt: '40px' // leave space for header
        }}
      >
        <img 
          src={fileUrl} 
          alt={fileName || 'Uploaded content'} 
          style={{ 
            maxHeight: '100%', 
            maxWidth: '100%', 
            objectFit: 'contain'  // Ensures the image is scaled proportionally without cropping
          }} 
        />
      </Box>
      
      {/* Message container: occupies the bottom 30% */}
      <Box 
        sx={{
          height: '30%',
          width: '100%',
          padding: '8px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* AutoScaleText adjusts font size so the message fits within the container */}
        <AutoScaleText minFontSize={12} maxFontSize={24}>
          {message}
        </AutoScaleText>
      </Box>
    </Card>
  );
};

export default PostCard;