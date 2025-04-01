"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

const SideBanner = ({ title, message, qrUrl, align = "left" }) => {
  const rotate = align === "left" ? "rotate(-90deg)" : "rotate(90deg)";
  const position = align === "left" ? { left: 0 } : { right: 0 };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        ...position,
        width: 360, // Wider banner for better spacing
        height: 1280,
        backgroundColor: "#000",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 5,
        overflow: "hidden",
        pointerEvents: "none",
        px: 2,
        py: 2,
      }}
    >
      {/* Top QR Code */}
      <Box sx={{ mt: 4, backgroundColor: "white", p: 1.5, borderRadius: 2 }}>
        <QRCodeCanvas value={qrUrl} size={260} />
      </Box>

      {/* Center Text (rotated) */}
      <Box
        sx={{
          transform: rotate,
          transformOrigin: "center",
          textAlign: "center",
          width: 1000,
          px: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            fontSize: "3.4rem",
            lineHeight: 1.2,
            letterSpacing: "0.05em",
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1.8rem",
            maxWidth: "80%",
            whiteSpace: "normal",
            wordBreak: "break-word",
            textAlign: "center",
          }}
        >
          {message}
        </Typography>
      </Box>

      {/* Bottom QR Code */}
      <Box sx={{ mb: 4, backgroundColor: "white", p: 1.5, borderRadius: 2 }}>
        <QRCodeCanvas value={qrUrl} size={260} />
      </Box>
    </Box>
  );
};

export default SideBanner;
