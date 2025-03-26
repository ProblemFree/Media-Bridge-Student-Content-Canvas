"use client";

import { useState, useEffect } from "react";
import {
  db,
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function Dashboard() {
  const { user, isAdmin, loading } = useAdminAuth();

  const [submissions, setSubmissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isAdmin) LoadSubmissions();
  }, [isAdmin]);

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

  const deleteSubmission = async (id) => {
    try {
      await deleteDoc(doc(db, "uploads", id));
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete submission:", err);
    }
  };

  const handleBatchUpdate = async (status) => {
    if (status) {
      await Promise.all(selectedIds.map((id) => updateStatus(id, true)));
    } else {
      // Revert if accepted, delete if pending
      const toDelete = submissions.filter((s) => selectedIds.includes(s.id) && !s.accepted);
      const toRevert = submissions.filter((s) => selectedIds.includes(s.id) && s.accepted);

      await Promise.all(toDelete.map((s) => deleteSubmission(s.id)));
      await Promise.all(toRevert.map((s) => updateStatus(s.id, false)));
    }
    setSelectedIds([]);
  };

  const filtered = submissions.filter((s) => {
    if (filterType !== "all" && s.postType !== filterType) return false;
    if (search && !s.message?.toLowerCase().includes(search.toLowerCase()) && !s.userId?.includes(search)) return false;
    return true;
  });

  const pending = filtered.filter((s) => !s.accepted);
  const accepted = filtered.filter((s) => s.accepted);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h6">🔒 Admin access only</Typography>
        <Typography>Please log in with an authorized admin account.</Typography>
      </Box>
    );
  }

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
                  <Button color="error" variant="contained" onClick={() => { setDeleteTarget(submission.id); setConfirmDeleteOpen(true); }} sx={{ '&:hover': { backgroundColor: "#dc2626" } }}>Reject</Button>
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

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this submission? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deleteTarget) deleteSubmission(deleteTarget);
              setConfirmDeleteOpen(false);
              setDeleteTarget(null);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
