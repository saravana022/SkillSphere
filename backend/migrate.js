const db = require('./config/db');

async function migrate() {
    try {
        console.log('Running migrations...');
        // Alter tasks status enum
        await db.query("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending', 'submitted', 'completed', 'rejected') DEFAULT 'pending'");
        console.log('✓ tasks status enum updated');
        
        // Create task_proofs table if it does not exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS task_proofs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_id INT NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ task_proofs table checked/created');
        
        try {
            await db.query("ALTER TABLE domains ADD COLUMN keywords TEXT AFTER roadmap");
            console.log('✓ keywords column added to domains');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ keywords column already exists in domains');
            } else {
                throw e;
            }
        }
        
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
