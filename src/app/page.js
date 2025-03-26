"use client";

import { useEffect, useState } from "react";
import { storage, db, collection, addDoc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import EmailVerificationModal from "../components/EmailVerificationModal";
import PostCard from "../components/PostCard";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifiedEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
      setShowModal(false);
    }
  }, []);

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!userEmail) return alert("User not verified.");
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
      userId: userEmail.split("@")[0],
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

  return (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <EmailVerificationModal open={showModal} onVerified={(email) => {
        setUserEmail(email);
        setShowModal(false);
      }} />

      <Typography variant="h4" gutterBottom>Share Your Message</Typography>

      <Box sx={{ my: 2 }}>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          onChange={handleFileChange}
        />
      </Box>

      <TextField
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something..."
        multiline
        fullWidth
        sx={{ maxWidth: 400, mb: 2 }}
      />

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!userEmail}
      >
        Submit
      </Button>

      {(image || message) && (
        <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
          <PostCard
            fileUrl={image ? URL.createObjectURL(image) : null}
            message={message}
            userId={userEmail?.split("@")[0]}
          />
        </Box>
      )}
    </Box>
  );
}
