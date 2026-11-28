"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui";
import { getFirebaseAuth } from "@/lib/firebase";

const SITE_ORIGIN = "https://hogbacktech.com";

function WebsiteFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function postAuth() {
      const user = getFirebaseAuth().currentUser;
      const frame = iframeRef.current?.contentWindow;
      if (!user || !frame) return;
      const idToken = await user.getIdToken();
      frame.postMessage({ type: "hogback-hub-auth", idToken }, SITE_ORIGIN);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== SITE_ORIGIN) return;
      const data = event.data as { type?: string } | null;
      if (data?.type === "hogback-website-admin-ready") {
        void postAuth();
      }
    }

    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => {
      void postAuth();
    }, 800);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Hogback Website Admin"
      src={`${SITE_ORIGIN}/admin?from=hub`}
      className="h-full w-full border-0 bg-[#eef2f6]"
      allow="fullscreen"
      onLoad={() => {
        const user = getFirebaseAuth().currentUser;
        const frame = iframeRef.current?.contentWindow;
        if (!user || !frame) return;
        void user.getIdToken().then((idToken) => {
          frame.postMessage({ type: "hogback-hub-auth", idToken }, SITE_ORIGIN);
        });
      }}
    />
  );
}

export default function WebsitePage() {
  const { logOut, user } = useAuth();

  return (
    <RequireAdmin>
      <div className="flex h-screen flex-col bg-[#0c1210]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121a16] px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-white">Website</p>
            <p className="truncate text-xs text-slate-400">
              hogbacktech.com homepage editor · {user?.email ?? "admin"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={SITE_ORIGIN} target="_blank" rel="noreferrer">
              <Button variant="secondary">View site</Button>
            </a>
            <Link href="/home">
              <Button variant="secondary">All products</Button>
            </Link>
            <Button variant="ghost" onClick={() => logOut()}>
              Sign out
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <WebsiteFrame />
        </div>
      </div>
    </RequireAdmin>
  );
}
