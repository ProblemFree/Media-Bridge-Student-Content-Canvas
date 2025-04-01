"use client";

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Button, Typography
} from '@mui/material';

const EmailVerificationModal = ({ open, onVerified }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendCode = async () => {
    if (!email.endsWith("@gatech.edu")) {
      setMessage("Please use a valid @gatech.edu email address.");
      return;
    }

    try {
      const code = generateCode();

      const res = await fetch("/api/sendVerificationEmail", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const result = await res.json();
      if (result.success) {
        setStep(2);
        setMessage("A verification code has been sent to your inbox.");
      } else {
        setMessage(result.error || "Failed to send code.");
      }
    } catch (err) {
      console.error("Error sending code:", err);
      setMessage("Unexpected error occurred.");
    }
  };

  const handleVerifyCode = async () => {
    const userId = email.split("@")[0];

    try {
      const res = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, userId })
      });

      const result = await res.json();
      if (result.success) {
        localStorage.setItem("verifiedEmail", email);
        localStorage.setItem("userId", userId);
        onVerified(email);
      } else {
        setMessage(result.error || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setMessage("Unexpected error during verification.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Email Verification</DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <>
            {/* Friendly disclaimer */}
            <Typography variant="body2" sx={{ mb: 2, color: "#6b7280" }}>
              <strong>Heads up!</strong><br />
              We ask for your Georgia Tech email to keep this space within the GT community.
              What you post will be linked to your email for moderation — but don’t worry, your name won’t be shown.
            </Typography>

            <TextField
              label="GT Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              autoFocus
            />
          </>
        ) : (
          <TextField
            label="Enter 6-digit Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            fullWidth
            autoFocus
          />
        )}
        {message && (
          <Typography color="error" variant="body2" mt={2}>
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {step === 1 ? (
          <Button onClick={handleSendCode} variant="contained">Send Code</Button>
        ) : (
          <Button onClick={handleVerifyCode} variant="contained">Verify</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmailVerificationModal;
