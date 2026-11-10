"use client";

import { useEffect } from "react";
import { startJourney } from "../lib/journey.ts";

// The page's motion is one imperative script working on the server-rendered markup. With JavaScript off, the sheets show painted stills.
export function JourneyClient() {
  useEffect(() => {
    startJourney();
  }, []);
  return null;
}
