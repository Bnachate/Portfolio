/**
 * Prefixes an absolute path with the basePath (e.g. /Portfolio in production).
 * Use it for <img src>, <a href> pointing to /public, and window.location,
 * which do not get the basePath automatically (unlike <Link> and router.push).
 */
export const withBasePath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
