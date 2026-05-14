"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

interface PublishButtonProps {
  onPublish?: () => void;
  /** Hold duration in milliseconds. Default 1800ms for financial commits. */
  holdDuration?: number;
  className?: string;
  /** Label shown in idle state. */
  label?: string;
  /** Label shown during the 600ms publishing flash. */
  publishingLabel?: string;
  /** Label shown during the success state. */
  publishedLabel?: string;
}

type State = "idle" | "holding" | "publishing" | "published";

/**
 * Press-and-hold confirm button. The user must sustain a press for
 * `holdDuration` before the action fires. Cancels on pointer leave,
 * touch end, blur, or key-up.
 *
 * Keyboard: Space key starts/cancels the hold. Enter fires the
 * fire-and-release commit path used by screen readers.
 *
 * Casa-specific tokens (no shadcn vars):
 *   ring track    rgba(26,26,26,0.18)
 *   ring fill     #1E5FBF (Signal Blue)
 *   holding bg    #FBF5E9 / color #6B4A12 (Shadow-Mode quartet)
 *   success bg    #F1F6F0 / color #2E6F2A (success quartet)
 */
export function PublishButton({
  onPublish,
  holdDuration = 1800,
  className = "",
  label = "Hold to confirm",
  publishingLabel = "Processing...",
  publishedLabel = "Done",
}: PublishButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const publishTimeoutRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (publishTimeoutRef.current) window.clearTimeout(publishTimeoutRef.current);
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const clearHoldTimers = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const commit = () => {
    clearHoldTimers();
    setState("publishing");
    setProgress(100);
    setAnimKey((k) => k + 1);
    onPublish?.();
    publishTimeoutRef.current = window.setTimeout(() => {
      setState("published");
      setAnimKey((k) => k + 1);
      resetTimeoutRef.current = window.setTimeout(() => {
        setState("idle");
        setProgress(0);
        setAnimKey((k) => k + 1);
      }, 3000);
    }, 600);
  };

  const startHold = () => {
    if (state !== "idle") return;
    setState("holding");
    setProgress(0);
    setAnimKey((k) => k + 1);
    startRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      if (!startRef.current) return;
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / holdDuration) * 100, 100));
    }, 30);
    timeoutRef.current = window.setTimeout(commit, holdDuration);
  };

  const cancelHold = () => {
    if (state !== "holding") return;
    clearHoldTimers();
    setState("idle");
    setProgress(0);
    setAnimKey((k) => k + 1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (!e.repeat) startHold();
    } else if (e.key === "Enter") {
      // Screen readers fire Enter as fire-and-release. Commit directly so
      // keyboard-only assistive users aren't locked out of the confirm path.
      e.preventDefault();
      if (state === "idle") commit();
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.code === "Space" || e.key === " ") {
      cancelHold();
    }
  };

  const labelText =
    state === "idle"
      ? label
      : state === "holding"
      ? "Hold..."
      : state === "publishing"
      ? publishingLabel
      : publishedLabel;

  return (
    <button
      type="button"
      disabled={state === "publishing"}
      className={`btn-publish btn-publish--${state} ${className}`.trim()}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={(e) => {
        e.preventDefault();
        startHold();
      }}
      onTouchEnd={cancelHold}
      onTouchCancel={cancelHold}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={cancelHold}
      aria-label={`${label} (press and hold to confirm)`}
    >
      <span key={`label-${animKey}`} className="btn-publish-label">
        {labelText}
      </span>
      {state === "holding" && (
        <svg
          key={`ring-${animKey}`}
          className="btn-publish-ring"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(26,26,26,0.18)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#1E5FBF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress}, 100`}
            style={{ transition: "stroke-dasharray 80ms linear" }}
          />
        </svg>
      )}
      {state === "published" && (
        <Check
          key={`check-${animKey}`}
          size={14}
          strokeWidth={2}
          className="btn-publish-check"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
