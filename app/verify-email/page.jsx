"use client";
import { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("Verifying...");
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      setStatus("Invalid verification link.");
      return;
    }
    const auth = getAuth();
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("Email verified successfully! You can now log in.");
      })
      .catch(() => {
        setStatus("Verification failed or link expired.");
      });
  }, [oobCode]);

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Email Verification</h1>
      <p>{status}</p>
    </div>
  );
}
