/**
 * Préfixe un chemin absolu avec le basePath (ex: /Portfolio en production).
 * À utiliser pour les <img src>, <a href> vers /public et window.location,
 * qui ne reçoivent pas le basePath automatiquement (contrairement à <Link> et router.push).
 */
export const withBasePath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
