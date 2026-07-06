-- ================================================================
-- Backfill existing images from all tables into media_library so
-- previously uploaded covers/photos/logos show up in the WordPress-
-- style picker. Safe to re-run: skips URLs already present.
-- ================================================================

-- Posts cover images
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), p.cover_image_url, p.cover_image_url,
       CONCAT('post-', p.slug), 'image/jpeg', p.created_at
  FROM posts p
 WHERE p.cover_image_url IS NOT NULL
   AND p.cover_image_url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = p.cover_image_url
   );

-- Projects cover images
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), pr.cover_image_url, pr.cover_image_url,
       CONCAT('project-', pr.slug), 'image/jpeg', pr.created_at
  FROM projects pr
 WHERE pr.cover_image_url IS NOT NULL
   AND pr.cover_image_url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = pr.cover_image_url
   );

-- Team member photos
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), t.photo, t.photo,
       CONCAT('team-', REPLACE(t.name,' ','-')), 'image/jpeg', t.created_at
  FROM team_members t
 WHERE t.photo IS NOT NULL
   AND t.photo <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = t.photo
   );

-- Partner logos + covers
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), pt.logo_url, pt.logo_url,
       CONCAT('partner-logo-', pt.id), 'image/png', pt.created_at
  FROM partners pt
 WHERE pt.logo_url IS NOT NULL
   AND pt.logo_url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = pt.logo_url
   );

INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), pt.cover_url, pt.cover_url,
       CONCAT('partner-cover-', pt.id), 'image/jpeg', pt.created_at
  FROM partners pt
 WHERE pt.cover_url IS NOT NULL
   AND pt.cover_url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = pt.cover_url
   );

-- Gallery album covers
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), ga.cover_url, ga.cover_url,
       CONCAT('album-', ga.slug), 'image/jpeg', ga.created_at
  FROM gallery_albums ga
 WHERE ga.cover_url IS NOT NULL
   AND ga.cover_url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = ga.cover_url
   );

-- Gallery items (images only)
INSERT INTO media_library (id, url, thumb_url, filename, mime, created_at)
SELECT UUID(), gi.url, COALESCE(NULLIF(gi.thumb_url,''), gi.url),
       COALESCE(gi.title, CONCAT('gallery-', gi.id)), 'image/jpeg', gi.created_at
  FROM gallery_items gi
 WHERE gi.kind = 'image'
   AND gi.url IS NOT NULL
   AND gi.url <> ''
   AND NOT EXISTS (
     SELECT 1 FROM media_library m WHERE m.url = gi.url
   );
