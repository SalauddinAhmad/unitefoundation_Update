// ============= Full file contents =============

1: const fs = require('fs/promises');
2: const path = require('path');
3: const pool = require('../db/pool');
4: 
5: async function optimizeExistingImages() {
6:   console.log('Starting bulk image optimization (Native Implementation)...');
7:   
8:   const uploadsRoot = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
9:   const mediaDir = path.join(uploadsRoot, 'media');
10:   
11:   try {
12:     const files = await fs.readdir(mediaDir);
13:     let count = 0;
14:     let totalSaved = 0;
15: 
16:     for (const file of files) {
17:       if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
18:       
19:       const filePath = path.join(mediaDir, file);
20:       const stats = await fs.stat(filePath);
21:       
22:       // Only process files larger than 200KB
23:       if (stats.size > 200 * 1024) {
24:         console.log(`Skipping ${file} (${(stats.size / 1024).toFixed(1)} KB) - Compression engine not available on this host.`);
25:         // Note: Without sharp or another native library, we can't safely compress in pure Node.js
26:         // We will inform the user about the environment limitation.
27:       }
28:     }
29:     
30:     console.log(`Scan complete. Environment does not support image compression.`);
31:   } catch (err) {
32:     console.error('Bulk optimization failed:', err);
33:   }
34: }
35: 
36: module.exports = { optimizeExistingImages };
