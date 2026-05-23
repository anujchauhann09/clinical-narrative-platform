import { authApi } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { useCopilotStore } from '../store/copilotStore.js';

/**
 * End the user's session.
 * - Tells the server to revoke the refresh token and clear cookies.
 * - Wipes in-memory auth state regardless of network outcome.
 * Safe to call from anywhere (button click, expired-refresh handler).
 */
export const signOut = async () => {
  try {
    await authApi.logout();
  } catch (_error) {
    // The server may have already invalidated the session; we still clear locally.
  } finally {
    useAuthStore.getState().clearSession();
    // Copilot chats are session-only — drop them on sign-out to avoid leaking
    // PHI to the next user on a shared device.
    useCopilotStore.getState().resetMessages();
    useCopilotStore.getState().closeChat();
  }
};
