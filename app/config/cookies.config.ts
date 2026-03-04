/**
 * Gestion des cookies pour les tokens d'authentification
 *
 * Stocke les accessToken et refreshToken dans les cookies du navigateur
 */

/**
 * Stocke les tokens dans les cookies
 * @param accessToken - Token d'accès JWT court terme
 * @param refreshToken - Token de rafraîchissement long terme
 */
export const setCookies = (accessToken: string, refreshToken: string) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const now = new Date();
  const expireAccessToken = new Date(now.getTime() + oneDay);
  const expireRefreshToken = new Date(now.getTime() + sevenDays);

  // Stocker l'accessToken (va expirer après 1 jour)
  document.cookie = `accessToken=${accessToken}; expires=${expireAccessToken.toUTCString()}; path=/; SameSite=Strict`;

  // Stocker le refreshToken (va expirer après 7 jours)
  document.cookie = `refreshToken=${refreshToken}; expires=${expireRefreshToken.toUTCString()}; path=/; SameSite=Strict`;
};

/**
 * Récupère un cookie par nom
 * @param name - Nom du cookie
 * @returns La valeur du cookie ou null
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
 * Supprime les cookies d'authentification
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
 * Vérifie si l'utilisateur est authentifié (accessToken présent)
 * @returns true si authentifié, false sinon
 */
export const isAuthenticated = (): boolean => {
  return getCookie('accessToken') !== null;
};
