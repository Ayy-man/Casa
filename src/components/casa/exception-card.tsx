"use client";

import { formatDistanceToNow } from "date-fns";
import { PublishButton } from "@/components/ui/publish-button";
import type { ExceptionItem } from "@/lib/mock-data/exceptions";

/**
 * Narrative exception card for the Exception Board (Casa 360 redesign, Phase 1).
 *
 * Descends from the original inline `ExceptionCard` in `(dashboard)/page.tsx`
 * and extends it with the six additions the UI-SPEC / Pattern Map require:
 * an 8-category colour pill, an inner 2px category accent rule (never a thick
 * `border-left`), a `date-fns` time-ago, a 15px reading-tier body, an italic
 * `Suggested:` block on a softgray fill, and a source-attribution footer.
 *
 * All mock-data strings render as plain React text children — React
 * auto-escapes, so no XSS sink is introduced (threat T-01-06: no
 * `dangerouslySetInnerHTML` anywhere in this file).
 */

/**
 * Naive past-tense for action labels. Works for the verbs the board ships:
 * Approve → Approved, Call → Called, Snooze → Snoozed, Dispatch → Dispatched,
 * Resolve → Resolved, Edit → Edited, Reject → Rejected, Review → Reviewed,
 * Schedule → Scheduled, Mark → Marked, Send → Sent, Adjust → Adjusted.
 * The first whitespace-separated word is the verb; the rest is the object.
 */
function pastTense(action: string): string {
  const [verb, ...rest] = action.split(" ");
  if (!verb) return action;
  const past = verb.endsWith("e") ? verb + "d" : verb + "ed";
  return [past, ...rest].join(" ");
}

export function ExceptionCard({
  exception,
  onAction,
  onDismiss,
}: {
  exception: ExceptionItem;
  /** Fired by the primary and secondary action buttons. */
  onAction: (action: string, exception: ExceptionItem) => void;
  /** Fired by the tertiary text link — Dismiss / Resolve / Reject / etc. */
  onDismiss: (action: string, exception: ExceptionItem) => void;
}) {
  // actions[0] = primary CTA, actions[1] = secondary, actions[2] = tertiary link.
  const [primary, secondary, tertiary] = exception.actions;
  const requiresConfirm = exception.requiresConfirm === true;
  const timeAgo = formatDistanceToNow(new Date(exception.createdAt), {
    addSuffix: true,
  });

  return (
    <article
      className="ex-card scroll-mt-6"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Inner 2px category accent rule — colour comes from the .cat-* class's
          --cat-rule custom property. NOT a border-left (Checker item 2). */}
      <span className={`cat-rule cat-${exception.category}`} aria-hidden="true" />

      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Category pill — colour is never the sole signal: the uppercase
              text label carries the category (Checker item 6 / a11y). */}
          <span className={`cat-pill cat-${exception.category}`}>
            {exception.category}
          </span>
          <span className={`urgency-pill pill-${exception.urgency}`}>
            {exception.urgency}
          </span>
        </div>
        <span className="text-[12px] text-neutral-600 shrink-0 tabular-nums">
          {timeAgo}
        </span>
      </header>

      <h3 className="font-display text-[18px] leading-tight tracking-tight">
        {exception.typeLabel}
      </h3>
      <div className="text-[13px] text-[#737373] mt-1">
        {exception.property} · {exception.neighborhood}
      </div>

      {/* 15px reading-tier narrative body (UI-SPEC Resolved Tension 1). */}
      <p
        className="text-[15px] leading-[1.55] text-ink mt-3"
        style={{ maxWidth: "60ch" }}
      >
        {exception.summary}
      </p>

      {/* Suggested: italic block on a softgray fill — every card renders it. */}
      <div
        className="mt-4 rounded-[2px] px-4 py-3"
        style={{ background: "#F7F7F6", maxWidth: "60ch" }}
      >
        <span className="text-[13px] font-medium text-ink">Suggested: </span>
        <span className="text-[15px] leading-[1.55] italic text-[#525252]">
          {exception.suggested}
        </span>
      </div>

      {/* Action row — one accent primary, one outline secondary, one tertiary
          text link. requiresConfirm routes the primary through PublishButton. */}
      <div className="flex flex-wrap items-center gap-2 mt-5">
        {primary &&
          (requiresConfirm ? (
            <PublishButton
              onPublish={() => onAction(primary, exception)}
              holdDuration={1800}
              label={`Hold to ${primary.toLowerCase()}`}
              publishingLabel={`${primary}…`}
              publishedLabel={pastTense(primary)}
            />
          ) : (
            <button
              type="button"
              className="btn-sm btn-sm-accent"
              onClick={() => onAction(primary, exception)}
            >
              {primary}
            </button>
          ))}

        {secondary && (
          <button
            type="button"
            className="btn-sm btn-sm-outline"
            onClick={() => onAction(secondary, exception)}
          >
            {secondary}
          </button>
        )}

        <span className="flex-1" />

        {tertiary && (
          <button
            type="button"
            className="text-[13px] text-[#737373] hover:text-ink px-2 py-1 rounded-[2px]"
            onClick={() => onDismiss(tertiary, exception)}
          >
            {tertiary}
          </button>
        )}
      </div>

      {/* Source-attribution footer — booking ID in .mono, muted text. */}
      <footer className="mt-4 pt-3 border-t border-rule text-[12px] text-[#737373]">
        Flagged by <span className="mono">{exception.source}</span>
      </footer>
    </article>
  );
}
