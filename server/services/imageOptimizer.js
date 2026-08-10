const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp'); // We'll try to use sharp if available, else fallback
const pool = require('../db/pool');

async function optimizeExistingImages() {
  console.log('Starting bulk image optimization...');
  
  const uploadsRoot = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
  const mediaDir = path.join(uploadsRoot, 'media');
  
  try {
    const files = await fs.readdir(mediaDir);
    let count = 0;
    let totalSaved = 0;

    for (const file of files) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;
      
      const filePath = path.join(mediaDir, file);
      const stats = await fs.stat(filePath);
      
      // Only process files larger than 200KB
      if (stats.size > 200 * 1024) {
        console.log(`Optimizing ${file} (${(stats.size / 1024).toFixed(1)} KB)...`);
        
        const buffer = await fs.readFile(filePath);
        const originalSize = buffer.length;
        
        try {
          const optimizedBuffer = await sharp(buffer)
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
            
          const newName = file.replace(/\.[^.]+$/, '') + '.webp';
          const newPath = path.join(mediaDir, newName);
          
          await fs.writeFile(newPath, optimizedBuffer);
          
          // Update DB references
          const oldUrl = `/uploads/media/${file}`;
          const newUrl = `/uploads/media/${newName}`;
          
          const tables = [
            { name: 'projects', cols: ['cover_image_url'] },
            { name: 'posts', cols: ['cover_image_url'] },
            { name: 'team_members', cols: ['photo'] },
            { name: 'gallery_items', cols: ['url', 'thumb_url'] },
            { name: 'partners', cols: ['logo_url', 'logo'] },
            { name: 'media_library', cols: ['url', 'thumb_url'] },
            { name: 'settings', cols: ['value'] }
          ];
          
          for (const t of tables) {
            for (const col of t.cols) {
              if (t.name === 'settings') {
                await pool.execute(
                  `UPDATE settings SET value = REPLACE(value, ?, ?) WHERE value LIKE ?`,
                  [oldUrl, newUrl, `%${oldUrl}%`]
                );
              } else {
                await pool.execute(
                  `UPDATE \`${t.name}\` SET \`${col}\` = REPLACE(\`${col}\`, ?, ?) WHERE \`${col}\` LIKE ?`,
                  [oldUrl, newUrl, `%${oldUrl}%`]
                );
              }
            }
          }
          
          // If the name changed (not webp before), remove old file
          if (file !== newName) {
            await fs.unlink(filePath);
          }
          
          const saved = originalSize - optimizedBuffer.length;
          totalSaved += saved;
          count++;
          console.log(`Done. Saved ${(saved / 1024).toFixed(1)} KB`);
        } catch (err) {
          console.error(`Failed to optimize ${file}:`, err.message);
        }
      }
    }
    
    console.log(`Optimization complete. Processed ${count} images. Total space saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB`);
  } catch (err) {
    console.error('Bulk optimization failed:', err);
  }
}

module.exports = { optimizeExistingImages };
