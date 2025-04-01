"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Select, MenuItem, Button, Checkbox, TextField,
  Card, CardActions, CardContent, Accordion, AccordionSummary,
  AccordionDetails, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAdminAuth from "@/hooks/useAdminAuth";
import PostCard from "@/components/PostCard";

export default function DashboardClient() {
  const { user, isAdmin, loading } = useAdminAuth();
  const [submissions, setSubmissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState([]);
  const pollingRef = useRef(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/moderation/getSubmissions");
      const data = await res.json();
      if (data.success) {
        const updated = data.submissions || [];

        // Retain selected IDs if still present
        const validSelected = selectedIds.filter((id) =>
          updated.find((s) => s.id === id)
        );
        setSelectedIds(validSelected);
        setSubmissions(updated);
      } else {
        console.error("Failed to load submissions:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
      pollingRef.current = setInterval(fetchSubmissions, 5000);
    }
    return () => clearInterval(pollingRef.current);
  }, [isAdmin]);

  const approveSubmission = async (id) => {
    await fetch("/api/moderation/approve", {
      method: "POST",
      body: JSON.stringify({ id, moderator: user?.email || "unknown" }),
    });
    fetchSubmissions();
  };

  const rejectSubmission = async (id) => {
    await fetch("/api/moderation/reject", {
      method: "POST",
      body: JSON.stringify({ id, moderator: user?.email || "unknown" }),
    });
    fetchSubmissions();
  };

  const revertSubmission = async (id) => {
    await fetch("/api/moderation/revert", {
      method: "POST",
      body: JSON.stringify({ id, moderator: user?.email || "unknown" }),
    });
    fetchSubmissions();
  };

  const handleBatchAction = (action) => {
    const isPending = selectedIds.every((id) =>
      pending.find((p) => p.id === id)
    );
    const isAccepted = selectedIds.every((id) =>
      accepted.find((a) => a.id === id)
    );

    if (!isPending && !isAccepted) {
      alert("Please only select pending or accepted posts, not both.");
      return;
    }

    if (action === "approve") {
      selectedIds.forEach((id) => approveSubmission(id));
    } else if (action === "revert") {
      selectedIds.forEach((id) => revertSubmission(id));
    } else if (action === "delete") {
      setDeleteQueue([...selectedIds]);
      setConfirmDeleteOpen(true);
    }

    setSelectedIds([]);
  };

  const handleConfirmedDelete = async () => {
    for (const id of deleteQueue) {
      await rejectSubmission(id);
    }
    setConfirmDeleteOpen(false);
    setDeleteQueue([]);
    setSelectedIds([]);
  };

  const filtered = submissions.filter((s) => {
    if (filterType !== "all" && s.postType !== filterType) return false;
    if (
      search &&
      !s.message?.toLowerCase().includes(search.toLowerCase()) &&
      !s.userId?.includes(search)
    )
      return false;
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

  const showApprove =
    selectedIds.length && selectedIds.every((id) => pending.find((p) => p.id === id));
  const showRevert =
    selectedIds.length && selectedIds.every((id) => accepted.find((a) => a.id === id));
  const showDelete =
    selectedIds.length && selectedIds.every((id) => pending.find((p) => p.id === id));

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

        {showApprove && (
          <Button onClick={() => handleBatchAction("approve")} color="success" variant="contained">
            Approve Selected
          </Button>
        )}
        {showRevert && (
          <Button
            onClick={() => handleBatchAction("revert")}
            sx={{
              backgroundColor: "#facc15",
              color: "black",
              "&:hover": { backgroundColor: "#fde047" },
            }}
          >
            Revert Selected
          </Button>
        )}
        {showDelete && (
          <Button
            onClick={() => handleBatchAction("delete")}
            sx={{
              backgroundColor: "#dc2626",
              color: "white",
              "&:hover": { backgroundColor: "#b91c1c" },
            }}
          >
            Delete Selected
          </Button>
        )}
      </Box>

      {/* Sections */}
      {[
        { title: "Pending Posts", data: pending, actions: ["approve", "reject"] },
        { title: "Accepted Posts", data: accepted, actions: ["revert"] },
      ].map(({ title, data, actions }) => (
        <Accordion key={title} defaultExpanded sx={{ backgroundColor: "#1f2937", color: "white", mt: 4 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
            <Typography variant="h6">{title} ({data.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {data.map((s) => (
                <Card key={s.id} sx={{ width: 350, background: "#1e293b", color: "white" }}>
                  <Checkbox
                    checked={selectedIds.includes(s.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedIds((prev) =>
                        checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                      );
                    }}
                    sx={{ color: "white" }}
                  />
                  <PostCard
                    fileUrl={s.fileUrl}
                    message={s.message}
                    userId={s.userId || "Unknown"}
                  />
                  <CardContent>
                    <Typography variant="caption">
                      {new Date(s.timestamp).toLocaleString() || "Invalid Date"}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "center" }}>
                    {actions.includes("approve") && (
                      <Button
                        color="success"
                        variant="contained"
                        onClick={() => approveSubmission(s.id)}
                        sx={{ "&:hover": { backgroundColor: "#15803d" } }}
                      >
                        Approve
                      </Button>
                    )}
                    {actions.includes("reject") && (
                      <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                          setDeleteQueue([s.id]);
                          setConfirmDeleteOpen(true);
                        }}
                        sx={{ "&:hover": { backgroundColor: "#dc2626" } }}
                      >
                        Reject
                      </Button>
                    )}
                    {actions.includes("revert") && (
                      <Button
                        sx={{
                          backgroundColor: "#facc15",
                          color: "black",
                          "&:hover": { backgroundColor: "#fde047" },
                        }}
                        onClick={() => revertSubmission(s.id)}
                      >
                        Revert
                      </Button>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete {deleteQueue.length} submission(s)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmedDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
