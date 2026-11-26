"use client";

import { useEffect } from "react";
import {
  isDeveloperContactMailto,
  trackContactConversion,
} from "@/lib/google-ads";

function eventElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

/** The activated control whose href opens the developer mailbox, if any. */
function developerMailtoControl(target: EventTarget | null): Element | null {
  const element = eventElement(target);
  if (!element) return null;
  const control = element.closest("[href]");
  if (!control) return null;
  if (!isDeveloperContactMailto(control.getAttribute("href"))) return null;
  return control;
}

function isNativeLink(control: Element): boolean {
  return control instanceof HTMLAnchorElement || control instanceof HTMLAreaElement;
}

function isButtonLike(control: Element): boolean {
  if (control instanceof HTMLButtonElement) return true;
  if (
    control instanceof HTMLInputElement &&
    (control.type === "button" || control.type === "submit" || control.type === "reset")
  ) {
    return true;
  }
  return control.getAttribute("role") === "button";
}

/**
 * Fires the Contact conversion when a visitor activates a
 * mailto:developer@hogbacktech.com control. Delegated so links added later
 * (including from other branches) are included. Does not run on page view.
 */
export function MailtoContactConversion() {
  useEffect(() => {
    let ignoreFollowingClick = false;

    const onClick = (event: MouseEvent) => {
      if (ignoreFollowingClick || event.button !== 0) return;
      if (!developerMailtoControl(event.target)) return;
      trackContactConversion();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const control = developerMailtoControl(event.target);
      if (!control || isNativeLink(control)) return;
      if (event.key === " " && !isButtonLike(control)) return;

      trackContactConversion();
      // Buttons also emit a click for the same keypress. Count it once.
      ignoreFollowingClick = true;
      window.setTimeout(() => {
        ignoreFollowingClick = false;
      }, 0);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
