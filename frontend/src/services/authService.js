import { authApi } from '../api/authApi.js';
import { clearCsrfToken } from '../api/apiClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useCopilotStore } from '../store/copilotStore.js';


export const signOut = async () => {
  try {
    await authApi.logout();
  } catch (_error) {
  } finally {
    useAuthStore.getState().clearSession();
    clearCsrfToken();

    useCopilotStore.getState().resetMessages();
    useCopilotStore.getState().closeChat();
  }
};
