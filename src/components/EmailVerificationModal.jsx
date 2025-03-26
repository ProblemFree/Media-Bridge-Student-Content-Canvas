"use client";

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Button, Typography
} from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '/lib/firebaseConfig';
import sha256 from 'crypto-js/sha256';

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
    const code = generateCode();
    const codeHash = sha256(code).toString();

    await addDoc(collection(db, "verificationCodes"), {
      email,
      codeHash,
      createdAt: serverTimestamp(),
      verified: false,
    });

    // Send code via email using Firebase Function or Email API
    await fetch("/api/sendVerificationEmail", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    setStep(2);
    setMessage("A verification code has been sent to your inbox.");
  };

  const handleVerifyCode = async () => {
    const hash = sha256(code).toString();
    const res = await fetch("/api/verifyCode", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codeHash: hash })
    });

    const result = await res.json();
    if (result.success) {
        const userId = email.split("@")[0];
        localStorage.setItem("verifiedEmail", email);
        localStorage.setItem("userId", userId); // Save ID for uploads
        onVerified(email);
    } else {
        setMessage(result.error || "Verification failed.");
    }
      
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Email Verification</DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <TextField label="GT Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
        ) : (
          <TextField label="Enter 6-digit Code" value={code} onChange={e => setCode(e.target.value)} fullWidth />
        )}
        <Typography color="error" variant="body2" mt={2}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        {step === 1 ? (
          <Button onClick={handleSendCode} variant="contained">Send Code</Button>
        ) : (
          <Button onClick={handleVerifyCode} variant="contained">Verify</Button>
        )}
      </DialogActions>
      <Button
            onClick={() => {
                localStorage.removeItem("verifiedEmail");
                localStorage.removeItem("userId");
                window.location.reload();
            }}
            variant="outlined"
            color="warning"
            sx={{ mt: 2 }}
            >
            Log out
        </Button>
    </Dialog>
  );
};

export default EmailVerificationModal;