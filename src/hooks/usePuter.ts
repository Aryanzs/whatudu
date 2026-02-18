import { useState, useEffect, useCallback } from "react";
import puter from "@heyputer/puter.js";

interface PuterStatus {
  isReady: boolean;
  isSignedIn: boolean;
  username: string | null;
  error: string | null;
}

/**
 * usePuter — hook that manages Puter.js initialization and auth state
 *
 * Puter.js uses a "User-Pays" model:
 * - Developer includes the SDK (free)
 * - Users sign in with their Puter account
 * - AI usage is billed to the user's Puter account
 * - No API keys needed from the developer
 */
export const usePuter = () => {
  const [status, setStatus] = useState<PuterStatus>({
    isReady: false,
    isSignedIn: false,
    username: null,
    error: null,
  });

  // Check Puter availability on mount
  useEffect(() => {
    const checkPuter = async () => {
      try {
        if (typeof puter === "undefined" || !puter.ai) {
          setStatus((prev) => ({
            ...prev,
            isReady: false,
            error: "Puter.js not loaded",
          }));
          return;
        }

        // Check if user is already signed in
        const signedIn = await puter.auth.isSignedIn();
        if (signedIn) {
          const user = await puter.auth.getUser();
          setStatus({
            isReady: true,
            isSignedIn: true,
            username: user?.username || null,
            error: null,
          });
        } else {
          setStatus({
            isReady: true,
            isSignedIn: false,
            username: null,
            error: null,
          });
        }
      } catch {
        setStatus({
          isReady: true,
          isSignedIn: false,
          username: null,
          error: null,
        });
      }
    };

    // Small delay to ensure Puter.js SDK has initialized
    const timer = setTimeout(checkPuter, 500);
    return () => clearTimeout(timer);
  }, []);

  // Sign in with Puter
  const signIn = useCallback(async () => {
    try {
      const result = await puter.auth.signIn();
      if (result) {
        const user = await puter.auth.getUser();
        setStatus({
          isReady: true,
          isSignedIn: true,
          username: user?.username || null,
          error: null,
        });
      }
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Sign in failed",
      }));
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await puter.auth.signOut();
      setStatus({
        isReady: true,
        isSignedIn: false,
        username: null,
        error: null,
      });
    } catch {
      // Silent fail on sign out
    }
  }, []);

  return { ...status, signIn, signOut };
};
