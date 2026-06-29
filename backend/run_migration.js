const fs = require('fs');
const path = require('path');
const { connectDB } = require('./src/config/db');

async function runMigration() {
    try {
        const pool = await connectDB();
        console.log('Running migration...');
        
        const sqlFilePath = path.join(__dirname, '../database/migration_add_payments.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Split by GO commands (case insensitive, whole line)
        const batches = sqlContent.split(/^\s*GO\s*$/im);
        
        for (let batch of batches) {
            batch = batch.trim();
            if (batch.length > 0) {
                await pool.request().query(batch);
                console.log('Executed batch successfully.');
            }
        }
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
