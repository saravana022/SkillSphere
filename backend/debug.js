const db = require('./config/db');

async function check() {
    try {
        const [cols] = await db.query("SHOW COLUMNS FROM tasks WHERE Field = 'status'");
        console.log('Status column definition:', cols[0].Type);
        
        const [tasks] = await db.query("SELECT id, title, status FROM tasks LIMIT 5");
        console.log('Tasks:', tasks);
        
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
check();
