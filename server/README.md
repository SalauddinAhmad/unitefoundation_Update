# Unite Foundation API

Express + MySQL REST API for unitefoundation.bd.

## Local dev
```bash
cd server
cp .env.example .env   # fill values
npm install
npm run migrate        # creates tables
npm run dev            # http://localhost:3000
```

## Create first admin (one-time, from any Node REPL or a small script)
```js
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');
const { uuid } = require('./utils/uid');
(async () => {
  const hash = await bcrypt.hash('ChangeMe123!', 12);
  await pool.execute(
    'INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?, "admin")',
    [uuid(), 'Admin', 'admin@unitefoundation.bd', hash]
  );
  process.exit(0);
})();
```

See `../DEPLOY.md` for cPanel setup.
