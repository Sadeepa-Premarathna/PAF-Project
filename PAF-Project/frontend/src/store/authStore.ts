// In-memory token store — never persisted to localStorage/sessionStorage
let accessToken: string | null = null;

export const authStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string) => { accessToken = token; },
  clearTokens: () => { accessToken = null; },
};
