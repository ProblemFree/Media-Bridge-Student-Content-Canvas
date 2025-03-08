"use client";
import { useState } from "react";
import { storage, db, collection, addDoc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const imageRef = ref(storage, `images/${image.name}`);

    try {
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);

      // Store file URL in Firestore
      await addDoc(collection(db, "uploads"), {
        fileName: image.name,
        fileUrl: url,
        timestamp: new Date(),
      });

      alert("Image uploaded & stored in Firestore!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Upload File & Store in Firestore</h1>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Upload</button>

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded File:</h3>
          <img src={imageUrl} alt="Uploaded" width="300" />
        </div>
      )}
    </div>
  );
}
