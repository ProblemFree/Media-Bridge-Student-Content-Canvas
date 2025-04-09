import { Modal, Box, Typography, Button } from "@mui/material";

const FeedbackPromptModal = ({ open, onClose, onConfirm, surveyUrl }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: "#1e293b",
          color: "white",
          padding: 4,
          borderRadius: 2,
          maxWidth: 400,
          margin: "auto",
          mt: "20vh",
          textAlign: "center"
        }}
      >
        <Typography variant="h6" gutterBottom>
          Your submission has been received!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Would you be willing to take a quick 3-minute survey to help us improve the Media Bridge?
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            onConfirm();
            window.open(surveyUrl, "_blank");
          }}
          sx={{ mr: 1 }}
        >
          Yes
        </Button>
        <Button variant="outlined" onClick={onClose}>
          No
        </Button>
      </Box>
    </Modal>
  );
};

export default FeedbackPromptModal;
