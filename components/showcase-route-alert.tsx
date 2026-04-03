"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  storageKey: string;
};

export function ShowcaseRouteAlert({ message, storageKey }: Props) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) return;
      window.alert(message);
      sessionStorage.setItem(storageKey, "seen");
    } catch {
      window.alert(message);
    }
  }, [message, storageKey]);

  return null;
}
