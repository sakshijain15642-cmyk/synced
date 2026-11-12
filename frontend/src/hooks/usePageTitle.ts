import { useEffect } from "react";

// Sets the browser tab title while the calling page is on screen.
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} - Synced` : "Synced";
    return () => {
      document.title = "Synced";
    };
  }, [title]);
}