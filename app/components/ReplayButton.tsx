"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { replayWebhook } from "@/app/actions";

export function ReplayButton({ eventId }: { eventId: string }) {
  // useTransition gives us a beautiful loading state without manually managing boolean flags
  const [isPending, startTransition] = useTransition();

  const handleReplay = () => {
    startTransition(async () => {
      await replayWebhook(eventId);
    });
  };

  return (
    <Button 
      onClick={handleReplay} 
      disabled={isPending}
      className="font-semibold"
    >
      {isPending ? "Replaying..." : "🔄 Replay Event"}
    </Button>
  );
}
