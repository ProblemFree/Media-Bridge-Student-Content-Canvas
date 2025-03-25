"use client";

import { useState, useEffect } from "react";
import {
  db,
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
} from "/lib/firebaseConfig";
import PostCard from "../../components/PostCard";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Checkbox,
  TextField,
  Card,
  CardActions,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    LoadSubmissions();
  }, []);

  async function LoadSubmissions() {
    const q = query(collection(db, "uploads"));
    const querySnapshot = await getDocs(q);
    let queryResults = [];
    querySnapshot.forEach((doc) => {
      let obj = doc.data();
      obj.id = doc.id;
      queryResults.push(obj);
    });
    setSubmissions(queryResults);
  }

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "uploads", id), { accepted: status });
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accepted: status } : s))
    );
  };

  const handleBatchUpdate = async (status) => {
    await Promise.all(selectedIds.map((id) => updateStatus(id, status)));
    setSelectedIds([]);
  };

  const filtered = submissions.filter((s) => {
    if (filterType !== "all" && s.postType !== filterType) return false;
    if (search && !s.message?.toLowerCase().includes(search.toLowerCase()) && !s.userId?.includes(search)) return false;
    return true;
  });

  const pending = filtered.filter((s) => !s.accepted);
  const accepted = filtered.filter((s) => s.accepted);

  return (
    <Box sx={{ p: 4, backgroundColor: "#111827", color: "white", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>Moderation Dashboard</Typography>

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user ID or message"
          sx={{ input: { color: "white" }, background: "#1f2937" }}
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ color: "white", background: "#1f2937" }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="image">Only Images</MenuItem>
          <MenuItem value="text">Only Text</MenuItem>
          <MenuItem value="image_text">Text & Image</MenuItem>
        </Select>
        {selectedIds.length > 0 && (
          <>
            <Button onClick={() => handleBatchUpdate(true)} color="success" variant="contained">Approve Selected</Button>
            <Button onClick={() => handleBatchUpdate(false)} sx={{ backgroundColor: "#facc15", color: "black", '&:hover': { backgroundColor: "#fde047" } }}>
              Revert/Reject
            </Button>
          </>
        )}
      </Box>

      {/* Pending Posts Section */}
      <Accordion defaultExpanded sx={{ backgroundColor: "#1f2937", color: "white" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Typography variant="h6">Pending Posts ({pending.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {pending.map((submission) => (
              <Card key={submission.id} sx={{ width: 350, background: "#1e293b", color: "white" }}>
                <Checkbox
                  checked={selectedIds.includes(submission.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedIds((prev) =>
                      checked ? [...prev, submission.id] : prev.filter((id) => id !== submission.id)
                    );
                  }}
                  sx={{ color: "white" }}
                />
                <PostCard fileUrl={submission.fileUrl} message={submission.message} userId={submission.userId || "Unknown"} />
                <CardContent>
                  <Typography variant="caption">
                    {new Date(submission.timestamp?.toDate?.() || submission.timestamp).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button color="success" variant="contained" onClick={() => updateStatus(submission.id, true)} sx={{ '&:hover': { backgroundColor: "#15803d" } }}>Approve</Button>
                  <Button color="error" variant="contained" onClick={() => updateStatus(submission.id, false)} sx={{ '&:hover': { backgroundColor: "#dc2626" } }}>Reject</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Accepted Posts Section */}
      <Accordion defaultExpanded sx={{ backgroundColor: "#1f2937", color: "white", mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Typography variant="h6">Accepted Posts ({accepted.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {accepted.map((submission) => (
              <Card key={submission.id} sx={{ width: 350, background: "#1e293b", color: "white" }}>
                <Checkbox
                  checked={selectedIds.includes(submission.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedIds((prev) =>
                      checked ? [...prev, submission.id] : prev.filter((id) => id !== submission.id)
                    );
                  }}
                  sx={{ color: "white" }}
                />
                <PostCard fileUrl={submission.fileUrl} message={submission.message} userId={submission.userId || "Unknown"} />
                <CardContent>
                  <Typography variant="caption">
                    {new Date(submission.timestamp?.toDate?.() || submission.timestamp).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button sx={{ backgroundColor: "#facc15", color: "black", '&:hover': { backgroundColor: "#fde047" } }} onClick={() => updateStatus(submission.id, false)}>Revert</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
