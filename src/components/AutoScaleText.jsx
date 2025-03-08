// AutoScaleText.jsx
// This component automatically adjusts its font size so that the text fits within its container.
// It uses a simple iterative approach by reducing the font size until the text no longer overflows.

import React, { useRef, useEffect, useState } from 'react';

const AutoScaleText = ({ children, minFontSize = 12, maxFontSize = 24, style = {}, ...rest }) => {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial font size
    let currentFontSize = maxFontSize;
    container.style.fontSize = `${currentFontSize}px`;

    // Reduce font size until text fits container or minFontSize is reached
    while (container.scrollHeight > container.clientHeight && currentFontSize > minFontSize) {
      currentFontSize -= 1;
      container.style.fontSize = `${currentFontSize}px`;
    }
    setFontSize(currentFontSize);
  }, [children, minFontSize, maxFontSize]);

  return (
    <div
      ref={containerRef}
      style={{ ...style, fontSize: `${fontSize}px`, width: '100%', textAlign: 'center' }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default AutoScaleText;