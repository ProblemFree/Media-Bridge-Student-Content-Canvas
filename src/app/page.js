
"use client";
import { useState } from "react";
import { storage } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // Upload image to Firebase Storage
  const handleUpload = async () => {
    if (!image) return;
    const imageRef = ref(storage, `images/${image.name}`);

    try {
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Next.js + Firebase Image Upload</h1>
      
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Upload</button>

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" width="300" />
        </div>
      )}
    </div>
  );
}
