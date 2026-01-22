/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: ':Portfolio',
  images: {
    unoptimized: true, // Obligatoire pour le déploiement statique sur GitHub Pages
  },
}

module.exports = nextConfig