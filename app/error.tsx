"use client";

import { useEffect } from "react";

import { StatusPage } from "@/components/status-page";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusPage variant="error" onRetry={reset} />;
}
