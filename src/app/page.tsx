"use client";

import { useCallback, useState } from "react";
import { Backdrop } from "@/components/hud/Backdrop";
import { BootSequence } from "@/components/core/BootSequence";
import { Dashboard } from "@/components/core/Dashboard";
import { InstallPrompt } from "@/components/core/InstallPrompt";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const onDone = useCallback(() => setBooted(true), []);

  return (
    <>
      <Backdrop />
      {!booted && <BootSequence onDone={onDone} />}
      {booted && <Dashboard />}
      {booted && <InstallPrompt />}
    </>
  );
}
