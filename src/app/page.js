"use client";

import { useEffect, useState } from "react";
import { storage, db, collection, addDoc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import EmailVerificationModal from "../components/EmailVerificationModal";
import PostCard from "../components/PostCard";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verifiedEmail");
      const storedId = localStorage.getItem("userId");
      if (storedEmail && storedId) {
        setUserEmail(storedEmail);
        setUserId(storedId);
        setShowModal(false);
      }
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verifiedEmail");
      const storedId = localStorage.getItem("userId");
      if (storedEmail && storedId) {
        setUserEmail(storedEmail);
        setUserId(storedId);
        setShowModal(false);
      }
    }
  }, []);

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!userEmail || !userId) return alert("User not verified.");
    if (!image && !message) return alert("Please submit an image, message, or both.");

    let fileUrl = "";
    let fileName = "";
    let postType = "text";

    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      fileUrl = await getDownloadURL(imageRef);
      fileName = image.name;
      postType = message ? "image_text" : "image";
    } else {
      postType = "text";
    }

    await addDoc(collection(db, "uploads"), {
      userId,
      email: userEmail,
      message,
      fileName,
      fileUrl,
      timestamp: new Date(),
      accepted: false,
      postType,
    });

    alert("Your submission has been uploaded!");
    setImage(null);
    setImageUrl("");
    setMessage("");
  };

  if (!hasMounted) return null; // or a loading skeleton

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

      <Typography variant="h4" gutterBottom>
        Share Your Message
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 3,
          maxWidth: 400,
          width: "100%",
          mt: 2,
          mb: 3,
          backgroundColor: "#334155",
          color: "white"
        }}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: "16px", color: "white" }}
        />

        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something..."
          multiline
          fullWidth
          InputProps={{ sx: { color: "white" } }}
          InputLabelProps={{ sx: { color: "white" } }}
          sx={{ mb: 2, backgroundColor: "#1e293b" }}
        />

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!userEmail || !userId}
          fullWidth
        >
          Submit
        </Button>

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

      {(image || message) && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <PostCard
            fileUrl={image ? URL.createObjectURL(image) : null}
            message={message}
            userId={userId || "anon"}
          />
        </Box>
      )}
    </Box>
  );
}
