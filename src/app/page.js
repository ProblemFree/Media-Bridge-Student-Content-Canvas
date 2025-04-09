"use client";

import { useEffect, useState } from "react";
import EmailVerificationModal from "../components/EmailVerificationModal";
import PostCard from "../components/PostCard";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import FeedbackPromptModal from "../components/FeedbackPromptModal";
const SURVEY_URL = "https://qualtricsxmg3qzt79d8.qualtrics.com/jfe/form/SV_80OCLT3kLlxlNd4"; // replace with your link

export default function Home() {
  const [image, setImage] = useState(null);          // selected file
  const [message, setMessage] = useState("");        // user input
  const [userEmail, setUserEmail] = useState(null);  // pulled from localStorage
  const [userId, setUserId] = useState(null);        // pulled from localStorage
  const [showModal, setShowModal] = useState(true);  // modal toggle
  const [hasMounted, setHasMounted] = useState(false); // hydration fix
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false); // remember if user accepted modal or not in session


  // Run once on mount to check localStorage for previously verified session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verifiedEmail");
      const storedId = localStorage.getItem("userId");
      if (storedEmail && storedId) {
        setUserEmail(storedEmail);
        setUserId(storedId);
        setShowModal(false);
      }
      setHasMounted(true); // resolve hydration warning
    }
  }, []);

  // Handle file selection from input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Please choose a file under 4MB.");
        return;
      }
      setImage(file);
    }
  };

  // Handle upload via FormData to API route
  const handleUpload = async () => {
    if (!userEmail || !userId) {
      alert("User not verified.");
      return;
    }

    if (!image && !message) {
      alert("Please submit an image, a message, or both.");
      return;
    }

    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("userId", userId);
    formData.append("message", message);
    formData.append("postType", image && message ? "image_text" : image ? "image" : "text");

    if (image) {
      formData.append("file", image);
      formData.append("fileName", image.name);
    }

    try {
      const res = await fetch("/api/submitPost", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        alert("Your submission has been uploaded!");
        setImage(null);
        setMessage("");
        setShowFeedbackPrompt(true); // <-- Trigger Feedback modal
      } else {
        alert("Submission failed: " + (result.error || "unknown error"));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("An unexpected error occurred.");
    }
  };

  // Prevent hydration mismatch during SSR
  if (!hasMounted) return null;

  return (
    <Box
      sx={{
        textAlign: "center",
        p: 2,
        minHeight: "100vh",
        backgroundColor: "#1e293b",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Email Verification Modal */}
      <EmailVerificationModal
        open={showModal}
        onVerified={(email) => {
          const id = email.split("@")[0];
          setUserEmail(email);
          setUserId(id);
          localStorage.setItem("verifiedEmail", email);
          localStorage.setItem("userId", id);
          setShowModal(false);
        }}
      />

      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Share Your Message
      </Typography>

      {/* Upload Form */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          maxWidth: 400,
          width: "100%",
          mt: 2,
          mb: 3,
          backgroundColor: "#334155",
          color: "white",
        }}
      >
        {/* File input */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: "16px", color: "white" }}
        />

        {/* Text input */}
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something..."
          multiline
          fullWidth
          slotProps={{ maxLength: 280 }}
          helperText={
            <Typography
              variant="caption"
              sx={{ color: message.length > 250 ? "orange" : "gray" }}
            >
              {`${message.length}/280 characters`}
            </Typography>
          }
          InputProps={{ sx: { color: "white" } }}
          InputLabelProps={{ sx: { color: "white" } }}
          sx={{ mb: 2, backgroundColor: "#1e293b" }}
        />

        {/* Submit button */}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!userEmail || !userId}
          fullWidth
        >
          Submit
        </Button>

        {/* Logout / Re-verify */}
        <Button
          onClick={() => {
            localStorage.removeItem("verifiedEmail");
            localStorage.removeItem("userId");
            window.location.reload();
          }}
          color="warning"
          fullWidth
          sx={{ mt: 1 }}
        >
          Log Out
        </Button>
      </Paper>

      {/* Live preview */}
      {(image || message) && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <PostCard
            fileUrl={image ? URL.createObjectURL(image) : null}
            message={message}
            userId={userId || "anon"}
          />
        </Box>
        
      )}
      <FeedbackPromptModal
        open={showFeedbackPrompt}
        onClose={() => setShowFeedbackPrompt(false)}
        onConfirm={() => setShowFeedbackPrompt(false)}
        surveyUrl={SURVEY_URL}
      />
    </Box>
  );
}
