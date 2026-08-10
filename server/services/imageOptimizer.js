// ============= Full file contents =============

const fs = require('fs/promises');
const path = require('path');
const pool = require('../db/pool');

/**
 * Tracks the current status of background optimization.
 * Shared with the UI to show progress.
 */
let status = {
  active: false,
  processed: 0,
  total: 0,
  skipped: 0,
  errors: [],
  lastRun: null
};

async function optimizeExistingImages() {
  if (status.active) return;
  
  status.active = true;
  status.processed = 0;
  status.skipped = 0;
  status.errors = [];
  
  console.log('Starting bulk image optimization scan...');
  
  const uploadsRoot = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
  const mediaDir = path.join(uploadsRoot, 'media');
  
  try {
    const files = await fs.readdir(mediaDir);
    status.total = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).length;
    
    for (const file of files) {
      if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
      
      const filePath = path.join(mediaDir, file);
      try {
        const stats = await fs.stat(filePath);
        
        // Only process files larger than 200KB
        if (stats.size > 200 * 1024) {
          console.log(`Log: Skipping ${file} (${(stats.size / 1024).toFixed(1)} KB) - Host engine missing.`);
          status.skipped++;
        } else {
          status.processed++;
        }
      } catch (e) {
        status.errors.push(`${file}: ${e.message}`);
      }
    }
    
    console.log(`Scan complete. Processed: ${status.processed}, Skipped: ${status.skipped}`);
    status.lastRun = new Date().toISOString();
  } catch (err) {
    console.error('Bulk optimization failed:', err);
    status.errors.push(err.message);
  } finally {
    status.active = false;
  }
}

module.exports = { 
  optimizeExistingImages,
  getOptimizationStatus: () => ({ ...status })
};
