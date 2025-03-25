"use client";

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Button, Typography
} from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
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
      localStorage.setItem("verifiedEmail", email);
      onVerified(email);
    } else {
      setMessage("Invalid or expired code.");
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
    </Dialog>
  );
};

export default EmailVerificationModal;