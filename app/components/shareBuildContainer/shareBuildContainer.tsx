"use client";

import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import styles from "./page.module.css";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shareUrl: string;
};

export default function ShareBuildContainer({
  open,
  setOpen,
  shareUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        fallbackCopyText(shareUrl);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      try {
        fallbackCopyText(shareUrl);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        setCopied(false);
      }
    }
  }

  function fallbackCopyText(text: string) {
    const textarea = document.createElement("textarea");

    textarea.value = text;

    textarea.setAttribute("readonly", "");

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    textarea.focus();

    textarea.setSelectionRange(0, textarea.value.length);

    const successful = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error("Unable to copy");
    }
  }

  if (!open) return null;

  return (
    <div
      className={styles.wrapper}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className={styles.container}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Close share dialog"
        >
          <XMarkIcon />
        </button>

        <div className={styles.header}>
          <span>SHARE BUILD</span>

          <h2>Share your build</h2>

          <p>Anyone with this link can view this version of your build.</p>
        </div>

        <div className={styles.linkContainer}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            aria-label="Share link"
          />

          <button
            type="button"
            onClick={copyLink}
            className={copied ? styles.copied : ""}
          >
            {copied ? (
              <>
                <CheckIcon />
              </>
            ) : (
              <>
                <CopyIcon />
              </>
            )}
          </button>
        </div>

        <p className={styles.notice}>
          This link is a snapshot of your current build. Changes you make later
          will not affect it.
        </p>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="9"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M15 9V7C15 5.89543 14.1046 5 13 5H7C5.89543 5 5 5.89543 5 7V13C5 14.1046 5.89543 15 7 15H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
