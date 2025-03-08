"use client";
import { useState, useEffect } from "react";
import { db, collection, getDocs, query, where, updateDoc, deleteDoc, doc } from "/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);

  async function LoadSubmissions()
  {
    const q = query(collection(db, "uploads"));
    const querySnapshot = await getDocs(q);
    let queryResults = []
    querySnapshot.forEach((doc) => {
      let obj = doc.data();
      obj.id = doc.id;
      queryResults.push(obj);
      // console.log(doc.id, " => ", doc.data());
    });
    console.log(queryResults);
    setSubmissions(queryResults)
  }

  useEffect(()=>{
    LoadSubmissions();
  }, [])

  async function ChangeSubmissionStatus(status, submissionId)
  {
    const document = doc(db, "uploads", submissionId);
    //Submission accepted so set to true in db
    if(status)
    {
      await updateDoc(document, {
        accepted: status
      });
    }
    //Submission not accepted so delete in db
    else
    {
      await deleteDoc(document);
    }
    LoadSubmissions();
  }

  function SubmissionPreview({fileUrl, message, id}) 
  {
    return (
      <Card sx={{ flexBasis: "24%", height:"380px" }}>
          <CardMedia
            component="img"
            height="250"
            src= {fileUrl}
            alt= {fileUrl}
            sx={{ padding: "1em 1em 0 1em", objectFit: "contain" }}
          />
          <CardContent sx={{height:"50px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: "10px"}}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {message}
            </Typography>
          </CardContent>
          <CardActions sx={{display:"flex", justifyContent:"center"}}>
            <IconButton aria-label="delete" size="large" color="warning" onClick={()=>{ChangeSubmissionStatus(false, id)}}>
              <HighlightOffIcon fontSize="large" color="warning"/>
            </IconButton>
            <IconButton aria-label="confirm" size="large" color="success"  onClick={()=>{ChangeSubmissionStatus(true, id)}}>
              <CheckCircleOutlineIcon fontSize="large" color="success"/>
            </IconButton>
          </CardActions>
      </Card>
    );
  }
  return (
    <div style={{display: "flex", flexWrap: "wrap", gap: "1%", rowGap: "30px", padding: "20px"}}>
      {submissions.map((submission)=>(
         <SubmissionPreview key={submission.id} fileUrl={submission.fileUrl} message={submission.message} id={submission.id}/>
      ))}
    </div>
  );
}
