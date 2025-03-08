"use client";
import { useState, useEffect } from "react";
import { storage, db, collection, addDoc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
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
