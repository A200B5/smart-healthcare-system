require('dotenv').config({ path: '../.env' });
const { connectDB, getPool } = require('../backend/src/config/db');
connectDB()
  .then(() => getPool().request().query("SELECT name, type_desc FROM sys.objects WHERE type IN ('U', 'V', 'P')"))
  .then(res => {
    console.log(JSON.stringify(res.recordset.map(r => ({ name: r.name, type: r.type_desc }))));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
