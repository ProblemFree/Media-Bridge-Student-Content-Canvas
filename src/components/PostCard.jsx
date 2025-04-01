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
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `
          0 4px 8px rgba(0,0,0,0.2),
          0 8px 16px rgba(0,0,0,0.15),
          inset 0 1px 1px rgba(255,255,255,0.05)
        `,
        display: 'flex',
        flexDirection: 'column',
        color: '#f0f8ff'
      }}
    >
      {/* Toggle this box to show/hide the user tag */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 500,
          zIndex: 2,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#fff' }}>
          {userId} says...
        </Typography>
      </Box> */}

      {/* Both image + text */}
      {hasImage && hasText ? (
        <>
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

          <Box
            sx={{
              height: '30%',
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(6px)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Typography
              ref={textRef}
              sx={{
                fontSize: `${fontSize}px`,
                color: '#f0f8ff',
                fontWeight: 500,
                wordWrap: 'break-word',
                textShadow: '0 0 6px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)'
              }}
            >
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
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <Typography
            ref={textRef}
            sx={{
              fontSize: `${fontSize}px`,
              color: '#f0f8ff',
              fontWeight: 500,
              wordWrap: 'break-word',
              textShadow: '0 0 6px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)'
            }}
          >
            {message}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default PostCard;
