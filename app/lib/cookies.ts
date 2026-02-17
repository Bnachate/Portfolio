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
    // Multiple méthodes de suppression pour s'assurer que ça fonctionne
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
    
    // Méthode 1 : Sans SameSite
    document.cookie = `accessToken=; expires=${pastDate}; path=/`;
    document.cookie = `refreshToken=; expires=${pastDate}; path=/`;
    
    // Méthode 2 : Avec max-age=0
    document.cookie = 'accessToken=; max-age=0; path=/';
    document.cookie = 'refreshToken=; max-age=0; path=/';
    
    // Méthode 3 : Définir à vide explicitement
    document.cookie = 'accessToken=; path=/; expires=0';
    document.cookie = 'refreshToken=; path=/; expires=0';
    
    console.log('✅ Cookies supprimés');
    console.log('Cookies actuels:', document.cookie);
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
