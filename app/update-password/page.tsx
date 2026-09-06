"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function updatePassword(e: FormEvent) {
    e.preventDefault();

    if (cooldown > 0) return;

    setError("");

    if (!password || !confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update password.";

      const cooldownMatch = message.match(/after\s+(\d+)\s+seconds?/i);

      if (cooldownMatch) {
        setCooldown(Number(cooldownMatch[1]));
        setError("");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>ACCOUNT RECOVERY</span>

          <h1>Create a new password</h1>

          <p>Enter a new password for your MHW Builder account.</p>
        </div>

        <form className={styles.form} onSubmit={updatePassword}>
          <div className={styles.field}>
            <label htmlFor="password">New password</label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm-password">Confirm password</label>

            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {cooldown > 0 && (
            <p className={styles.cooldown}>
              You can update your password in <strong>{cooldown}s</strong>
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading || cooldown > 0}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
