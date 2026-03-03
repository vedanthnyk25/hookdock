"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ interval = 3000 }: { interval?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Set up a timer to silently refresh the Server Component data
    const id = setInterval(() => {
      router.refresh(); 
    }, interval);

    // Clean up the timer when we leave the page
    return () => clearInterval(id);
  }, [router, interval]);

  // This component doesn't render any UI
  return null; 
}
