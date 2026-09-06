"use client";

import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/client";
import React, { FormEvent, useEffect, useState } from "react";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Logo from "@/app/assets/logo3.png";

type Props = {
  open: boolean | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
};

type AuthView = "login" | "signup" | "forgot";

export default function AuthContainer({ open, setOpen }: Props) {
  const [view, setView] = useState<AuthView>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  async function login(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!loginEmail.trim() || !loginPassword) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      closeAuthContainer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function signup(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      !signupPassword ||
      !confirmPassword
    ) {
      setError("Complete all fields.");
      return;
    }

    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: {
            full_name: signupName.trim(),
          },

          // Optional, but useful if email confirmations
          // are enabled in Supabase.
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        closeAuthContainer();
        return;
      }

      setMessage("Account created. Check your email to confirm your account.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    const email = forgotEmail.trim();

    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "If an account exists for that email, a password reset link has been sent.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send password reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to continue with Google.",
      );

      setLoading(false);
    }
  }

  function changeView(nextView: AuthView) {
    setView(nextView);
    setError("");
    setMessage("");
  }

  function closeAuthContainer() {
    if (setOpen) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");

      // Every time the auth modal opens,
      // start on Sign In.
      setView("login");
      setError("");
      setMessage("");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  return (
    <div
      className={
        open
          ? `${styles.authContainerWrapper} ${styles.open}`
          : styles.authContainerWrapper
      }
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthContainer();
        }
      }}
    >
      <div
        className={
          open ? `${styles.authContainer} ${styles.open}` : styles.authContainer
        }
      >
        <button
          className={styles.closeBtn}
          onClick={closeAuthContainer}
          aria-label="Close authentication"
        >
          <XMarkIcon />
        </button>

        <div className={styles.authBrand}>
          <img src={Logo.src} alt="" />

          <div>
            <span>MHW</span>
            <strong>Builder</strong>
          </div>
        </div>

        <div className={styles.authModeSwitcher}>
          <div
            className={`${styles.authModeSlider} ${
              view === "signup" ? styles.signup : ""
            }`}
          />

          <button
            type="button"
            className={`${styles.authModeBtn} ${
              view === "login" ? styles.active : ""
            }`}
            onClick={() => changeView("login")}
          >
            Sign in
          </button>

          <button
            type="button"
            className={`${styles.authModeBtn} ${
              view === "signup" ? styles.active : ""
            }`}
            onClick={() => changeView("signup")}
          >
            Create account
          </button>
        </div>

        {view === "forgot" ? (
          <div className={styles.forgotContainer}>
            <section className={styles.authPanel}>
              <div className={styles.authHeader}>
                <span>ACCOUNT RECOVERY</span>

                <h2>Reset password</h2>

                <p>
                  Enter the email associated with your account and we'll send
                  you a password reset link.
                </p>
              </div>

              <form className={styles.authForm} onSubmit={forgotPassword}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="forgot-email">Email address</label>

                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="hunter@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                {view === "forgot" && error && (
                  <div className={styles.errorMessage}>{error}</div>
                )}

                {view === "forgot" && message && (
                  <div className={styles.successMessage}>{message}</div>
                )}

                <button
                  className={styles.primaryBtn}
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? "Sending..." : "Send reset link"}</span>
                </button>

                <button
                  type="button"
                  className={styles.forgotPasswordBtn}
                  onClick={() => changeView("login")}
                >
                  Back to sign in
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className={styles.authViewport}>
            <div
              className={`${styles.authTrack} ${
                view === "signup" ? styles.showSignup : ""
              }`}
            >
              {/* ========================= */}
              {/* SIGN IN */}
              {/* ========================= */}

              <section className={styles.authPanel}>
                <div className={styles.authHeader}>
                  <span>WELCOME BACK</span>

                  <h2>Sign in</h2>

                  <p>Sign in to save builds and access your account.</p>
                </div>

                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={googleLogin}
                  disabled={loading}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/40px-Google_%22G%22_logo.svg.png"
                    alt=""
                  />
                  Continue with Google
                </button>

                <AuthDivider />

                <form className={styles.authForm} onSubmit={login}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="login-email">Email address</label>

                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="hunter@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.passwordLabelRow}>
                      <label htmlFor="login-password">Password</label>

                      <button
                        type="button"
                        className={styles.forgotPasswordBtn}
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          changeView("forgot");
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                      >
                        {showLoginPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {view === "login" && error && (
                    <div className={styles.errorMessage}>{error}</div>
                  )}

                  <button
                    className={styles.primaryBtn}
                    type="submit"
                    disabled={loading}
                  >
                    <span>{loading ? "Signing in..." : "Sign in"}</span>
                  </button>
                </form>
              </section>

              {/* ========================= */}
              {/* CREATE ACCOUNT */}
              {/* ========================= */}

              <section className={styles.authPanel}>
                <div className={styles.authHeader}>
                  <span>JOIN THE HUNT</span>

                  <h2>Create account</h2>

                  <p>
                    Create an account to save and manage your Monster Hunter
                    Wilds builds.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={googleLogin}
                  disabled={loading}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/40px-Google_%22G%22_logo.svg.png"
                    alt=""
                  />
                  Continue with Google
                </button>

                <AuthDivider />

                <form className={styles.authForm} onSubmit={signup}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="signup-name">Display name</label>

                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Hunter name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="signup-email">Email address</label>

                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="hunter@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="signup-password">Password</label>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowSignupPassword((prev) => !prev)}
                      >
                        {showSignupPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
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

                  {view === "signup" && error && (
                    <div className={styles.errorMessage}>{error}</div>
                  )}

                  {view === "signup" && message && (
                    <div className={styles.successMessage}>{message}</div>
                  )}

                  <button
                    className={styles.primaryBtn}
                    type="submit"
                    disabled={loading}
                  >
                    <span>
                      {loading ? "Creating account..." : "Create account"}
                    </span>
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthDivider() {
  return (
    <div className={styles.dividerContainer}>
      <span />
      <p>or</p>
      <span />
    </div>
  );
}
