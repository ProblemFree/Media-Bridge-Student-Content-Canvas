// AutoScaleText.jsx
// This component automatically adjusts its font size so that the text fits within its container.
// It uses a simple iterative approach by reducing the font size until the text no longer overflows.

// AutoScaleText.jsx
// A custom component that adjusts its font size to ensure the text fits vertically within its container.
// This implementation checks the container's scrollHeight versus clientHeight and reduces font size until it fits.

import React, { useRef, useEffect, useState } from 'react';

const AutoScaleText = ({ children, minFontSize = 12, maxFontSize = 24, style = {}, ...rest }) => {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Start at the maximum font size
    let currentFontSize = maxFontSize;
    container.style.fontSize = `${currentFontSize}px`;
    container.style.lineHeight = '1.2'; // Set a consistent line height

    // Decrease the font size until the text fits vertically
    while (container.scrollHeight > container.clientHeight && currentFontSize > minFontSize) {
      currentFontSize -= 1;
      container.style.fontSize = `${currentFontSize}px`;
    }
    setFontSize(currentFontSize);
  }, [children, minFontSize, maxFontSize]);

  return (
    <div
      ref={containerRef}
      style={{ 
        ...style, 
        fontSize: `${fontSize}px`, 
        width: '100%', 
        textAlign: 'center',
        overflow: 'hidden'
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default AutoScaleText;