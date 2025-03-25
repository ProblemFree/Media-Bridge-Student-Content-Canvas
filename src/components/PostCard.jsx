import React, { useRef, useEffect, useState } from 'react';
import { Card, Box, Typography } from '@mui/material';

const PostCard = ({ fileUrl, message, userId }) => {
  const hasImage = Boolean(fileUrl);
  const hasText = Boolean(message?.trim());
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(24);

  useEffect(() => {
    if (textRef.current) {
      let newFontSize = 24;
      const containerHeight = textRef.current.parentElement.clientHeight;
      while (textRef.current.scrollHeight > containerHeight && newFontSize > 12) {
        newFontSize -= 1;
        textRef.current.style.fontSize = `${newFontSize}px`;
      }
      setFontSize(newFontSize);
    }
  }, [message]);

  return (
    <Card
      sx={{
        width: 350,
        height: 350,
        position: 'relative',
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: 3,
        overflow: 'hidden' // ensures children like images don’t escape the rounded border
      }}
    >
      {/* User ID Tag */}
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
          fontSize: '12px',
          zIndex: 1
        }}
      >
        <Typography variant="caption">{userId} says...</Typography>
      </Box>

      {/* Image + Text Layout */}
      {hasImage && hasText ? (
        <>
          {/* Image Section */}
          <Box sx={{ height: '70%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <img
              src={fileUrl}
              alt="Uploaded content"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Text Section */}
          <Box
            sx={{
              height: '30%',
              width: '100%',
              padding: '8px',
              backgroundColor: '#334155',
              borderTop: '1px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Typography ref={textRef} sx={{ fontSize: `${fontSize}px`, wordWrap: 'break-word' }}>
              {message}
            </Typography>
          </Box>
        </>
      ) : hasImage ? (
        // Image Only
        <Box sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <img
            src={fileUrl}
            alt="Uploaded content"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      ) : (
        // Text Only
        <Box
          sx={{
            height: '100%',
            width: '100%',
            padding: '12px',
            backgroundColor: '#334155',
            border: '1px solid #475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <Typography ref={textRef} sx={{ fontSize: `${fontSize}px`, wordWrap: 'break-word' }}>
            {message}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default PostCard;
