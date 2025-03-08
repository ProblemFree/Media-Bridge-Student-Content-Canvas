// PostCard.jsx
// Renders a card (350x350 pixels) with:
// - A header at the top-left that says "userID says..."
// - An image (from fileUrl) that fills the top 70% of the card, scaled proportionally without cropping.
// - A message in the bottom 30% that auto-scales its font size to fit the container.

import React from 'react';
import { Card, Box } from '@mui/material';
import AutoScaleText from './AutoScaleText';

const PostCard = ({ fileUrl, message, userId, fileName }) => {
  return (
    <Card sx={{ width: 350, height: 350, position: 'relative' }}>
      {/* Image container: occupies top 70% of the card */}
      <Box
        sx={{
          height: '70%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={fileUrl}
          alt={fileName || 'Uploaded content'}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain' // Ensures proportional scaling without cropping
          }}
        />
        {/* Tag overlay in the top left corner */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '16px',
            maxWidth: '90%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AutoScaleText minFontSize={10} maxFontSize={16} style={{ margin: 0 }}>
            {userId} says...
          </AutoScaleText>
        </Box>
      </Box>
      
      {/* Message container: occupies bottom 30% of the card */}
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
        <AutoScaleText minFontSize={12} maxFontSize={24}>
          {message}
        </AutoScaleText>
      </Box>
    </Card>
  );
};

export default PostCard;