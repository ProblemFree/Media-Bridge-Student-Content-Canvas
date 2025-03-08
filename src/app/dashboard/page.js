"use client";
import { useState, useEffect } from "react";
import { db, collection, getDocs, query, where, updateDoc, deleteDoc, doc } from "/lib/firebaseConfig";
import Modal from "/Components/Modal";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalColor, setModalColor] = useState("#2e7d32");
  const [modalResponse, setModalResponse] = useState("");



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
    try{
      if(status)
        {
          await updateDoc(document, {
            accepted: status
          });
          setModalResponse("Submission successfully approved.");
        }
        //Submission not accepted so delete in db
        else
        {
          await deleteDoc(document);
          setModalResponse("Submission successfully rejected.");
        }
        setModalColor("#2e7d32");
        setIsModalOpen(true);
        LoadSubmissions();
    } 
    catch (error) {
      setModalResponse(`Error performing operation. ${error}`);
      setModalColor("#ed6c02");
      setIsModalOpen(true);
      throw error;
    }
    
  }

  function SubmissionPreview({fileUrl, message, id, accepted}) 
  {
    return (
      <Card sx={{ flexBasis: "24%", height: !accepted ? "380px" : "330px" }}>
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
          { !accepted ?
          <CardActions sx={{display:"flex", justifyContent:"center"}}>
            <IconButton aria-label="delete" size="large" color="warning" onClick={()=>{ChangeSubmissionStatus(false, id)}}>
              <HighlightOffIcon fontSize="large" color="warning"/>
            </IconButton>
            <IconButton aria-label="confirm" size="large" color="success"  onClick={()=>{ChangeSubmissionStatus(true, id)}}>
              <CheckCircleOutlineIcon fontSize="large" color="success"/>
            </IconButton>
          </CardActions>
          :
          <></>
          }
      </Card>
    );
  }

  return (
    <div style={{width: "100%", height:"100%",  padding: "20px"}}>
      <h1>Pending</h1>
      <div style={{display: "flex", flexWrap: "wrap", gap: "1%", rowGap: "30px", paddingTop: "20px", paddingBottom: "20px"}}>
        {submissions.filter((submission) => submission.accepted === false).map((submission)=>(
          <SubmissionPreview key={submission.id} fileUrl={submission.fileUrl} message={submission.message} id={submission.id} accepted={submission.accepted}/>
        ))}
      </div>
      <h1>Accepted</h1>
      <div style={{display: "flex", flexWrap: "wrap", gap: "1%", rowGap: "30px", paddingTop: "20px", paddingBottom: "20px"}}>
        {submissions.filter((submission) => submission.accepted === true).map((submission)=>(
          <SubmissionPreview key={submission.id} fileUrl={submission.fileUrl} message={submission.message} id={submission.id} accepted={submission.accepted}/>
        ))}
      </div>
      <Modal isVisible={isModalOpen} setVisible={() => setIsModalOpen(false)} response={modalResponse} color={modalColor}/>
      <Button sx={{position: "fixed", bottom: 30, right: 35}} variant="contained" endIcon={<RefreshIcon />} onClick={()=>LoadSubmissions()}>
        Refresh Submissions
      </Button>
    </div>
    
  );
}
