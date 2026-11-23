/**
 * Cookie management for authentication tokens
 *
 * Stores the accessToken and refreshToken in browser cookies
 */

/**
 * Stores the tokens in cookies
 * @param accessToken - Short-lived JWT access token
 * @param refreshToken - Long-lived refresh token
 */
export const setCookies = (accessToken: string, refreshToken: string) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const now = new Date();
  const expireAccessToken = new Date(now.getTime() + oneDay);
  const expireRefreshToken = new Date(now.getTime() + sevenDays);

  // Store the accessToken (expires after 1 day)
  document.cookie = `accessToken=${accessToken}; expires=${expireAccessToken.toUTCString()}; path=/; SameSite=Strict`;

  // Store the refreshToken (expires after 7 days)
  document.cookie = `refreshToken=${refreshToken}; expires=${expireRefreshToken.toUTCString()}; path=/; SameSite=Strict`;
};

/**
 * Gets a cookie by name
 * @param name - Cookie name
 * @returns The cookie value, or null
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Deletes the authentication cookies
 */
export const deleteCookies = () => {
  try {
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = `accessToken=; expires=${pastDate}; path=/; SameSite=Strict`;
    document.cookie = 'accessToken=; max-age=-1; path=/';

    document.cookie = `refreshToken=; expires=${pastDate}; path=/; SameSite=Strict`;
    document.cookie = 'refreshToken=; max-age=-1; path=/';
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des cookies:', error);
  }
};

/**
 * Checks whether the user is authenticated (accessToken present)
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return getCookie('accessToken') !== null;
};
