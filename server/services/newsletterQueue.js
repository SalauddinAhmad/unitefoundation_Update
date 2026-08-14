const pool = require('../db/pool');
const { sendMail } = require('./mailer');

const LOCK_NAME = 'unite_newsletter_worker';
let timer = null;
let running = false;

async function processNext() {
  if (running) return;
  running = true;
  let connection;
  let lockHeld = false;

  try {
    connection = await pool.getConnection();
    const [[lock]] = await connection.query('SELECT GET_LOCK(?, 0) AS acquired', [LOCK_NAME]);
    lockHeld = Number(lock && lock.acquired) === 1;
    if (!lockHeld) return;

    // Recover an item if a previous process was terminated while sending it.
    await connection.execute(
      `UPDATE newsletter_queue
       SET status = 'pending'
       WHERE status = 'processing' AND processed_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)`
    );

    const [rows] = await connection.execute(
      `SELECT q.id, q.campaign_id, q.email, q.attempts, c.subject, c.html
       FROM newsletter_queue q
       JOIN newsletter_campaigns c ON c.id = q.campaign_id
       WHERE q.status = 'pending' AND c.status IN ('queued', 'sending')
       ORDER BY q.id ASC LIMIT 1`
    );
    const item = rows[0];
    if (!item) return;

    await connection.execute(
      `UPDATE newsletter_queue
       SET status = 'processing', attempts = attempts + 1, processed_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [item.id]
    );
    await connection.execute(
      "UPDATE newsletter_campaigns SET status = 'sending' WHERE id = ? AND status = 'queued'",
      [item.campaign_id]
    );

    try {
      await sendMail({ to: item.email, subject: item.subject, html: item.html });
      await connection.execute(
        "UPDATE newsletter_queue SET status = 'sent', last_error = NULL, processed_at = NOW() WHERE id = ?",
        [item.id]
      );
      await connection.execute(
        'UPDATE newsletter_campaigns SET sent_count = sent_count + 1 WHERE id = ?',
        [item.campaign_id]
      );
    } catch (error) {
      const message = String(error && error.message ? error.message : error).slice(0, 500);
      const retry = Number(item.attempts || 0) + 1 < 3;
      await connection.execute(
        `UPDATE newsletter_queue
         SET status = ?, last_error = ?, processed_at = NOW() WHERE id = ?`,
        [retry ? 'pending' : 'failed', message, item.id]
      );
      if (!retry) {
        await connection.execute(
          'UPDATE newsletter_campaigns SET failed_count = failed_count + 1 WHERE id = ?',
          [item.campaign_id]
        );
      }
      console.error('[newsletter-worker] send failed:', item.email, message);
    }

    await connection.execute(
      `UPDATE newsletter_campaigns c
       SET c.status = 'completed', c.completed_at = NOW()
       WHERE c.id = ? AND NOT EXISTS (
         SELECT 1 FROM newsletter_queue q
         WHERE q.campaign_id = c.id AND q.status IN ('pending', 'processing')
       )`,
      [item.campaign_id]
    );
  } catch (error) {
    // Missing queue tables before migration should not stop the website.
    console.error('[newsletter-worker] tick failed:', error && error.message);
  } finally {
    if (connection) {
      if (lockHeld) {
        try { await connection.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]); } catch { /* connection cleanup */ }
      }
      connection.release();
    }
    running = false;
  }
}

function start() {
  if (timer) return;
  const interval = Math.max(3000, Number(process.env.NEWSLETTER_SEND_INTERVAL_MS || 5000));
  timer = setInterval(processNext, interval);
  timer.unref?.();
  setTimeout(processNext, 1000).unref?.();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop, processNext };