"use client";
import { useState } from "react";
import { storage, db, collection, addDoc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostCard from "../components/PostCard";
import { Box, Button, TextField, IconButton, Typography, Paper } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
      setImageUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImageUrl("");
  };

  const handleUpload = async () => {
    if (!image && !message.trim()) {
      alert("Please provide an image or text before submitting.");
      return;
    }

    setUploading(true);
    let fileUrl = "";

    try {
      if (image) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        fileUrl = await getDownloadURL(imageRef);
      }

      const postType = fileUrl && message.trim() ? "image_text"
                       : fileUrl ? "image"
                       : "text";

      await addDoc(collection(db, "uploads"), {
        userId: "Anonymous",
        message: message.trim() || "",
        fileName: image ? image.name : "",
        fileUrl: fileUrl,
        timestamp: new Date(),
        accepted: false,
        postType: postType,
      });

      alert("Submission successful!");
      setImage(null);
      setImageUrl("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        p: 3,
        maxWidth: "100%",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white"
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "600px" }}>
        <Typography variant="h5" gutterBottom color="white">
          Submit Your Post
        </Typography>
  
        {/* Upload Input Row */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={1}
          mb={2}
          sx={{ backgroundColor: "#1e293b", p: 2, borderRadius: 2 }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/gif"
            style={{
              color: "white",
              backgroundColor: "#334155",
              border: "1px solid #475569",
              padding: "8px",
              borderRadius: "4px"
            }}
          />
          {image && (
            <IconButton onClick={handleClearImage} color="error">
              <ClearIcon />
            </IconButton>
          )}
        </Box>
  
        {/* Text Input */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Enter your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            mb: 2,
            backgroundColor: "#1e293b",
            input: { color: "white" },
            textarea: { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#475569"
              },
              "&:hover fieldset": {
                borderColor: "#94a3b8"
              },
              "&.Mui-focused fieldset": {
                borderColor: "#38bdf8"
              }
            }
          }}
          InputLabelProps={{
            style: { color: "#cbd5e1" }
          }}
        />
  
        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
          sx={{
            mt: 1,
            backgroundColor: "#3b82f6",
            "&:hover": {
              backgroundColor: "#2563eb"
            }
          }}
        >
          Submit
        </Button>
      </Box>
  
      {/* Live Preview Centered Below Form */}
      <Box mt={6} textAlign="center">
        <Typography variant="subtitle1" gutterBottom color="white">
          Live Preview
        </Typography>
        <PostCard fileUrl={imageUrl} message={message} userId="You" />
      </Box>
    </Box>
  );
}
