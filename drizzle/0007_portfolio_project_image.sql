-- Data: the portfolio project still pointing to the old preview image (old domain, old design) gets
-- the screenshot of the current site, served from /projects/portfolio.jpg. Any other image is left as is.
UPDATE "projects"
SET "project_image_url" = 'https://brahimnachate.fr/projects/portfolio.jpg'
WHERE "project_image_url" = 'https://portfolio-seven-delta-irb39wuqmp.vercel.app/opengraph-image';
