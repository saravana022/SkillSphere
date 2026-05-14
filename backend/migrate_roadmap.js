/**
 * Migration: Add roadmap_checkpoints table and seed data
 * Run once: node migrate_roadmap.js
 */
require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Creating roadmap_checkpoints table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS roadmap_checkpoints (
                id INT AUTO_INCREMENT PRIMARY KEY,
                domain_id INT NOT NULL,
                phase VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Table created');

        // Check if data already exists
        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM roadmap_checkpoints');
        if (count > 0) {
            console.log(`✓ Already has ${count} checkpoints, skipping seed`);
            process.exit(0);
        }

        // Get domain IDs dynamically
        const [domains] = await db.query('SELECT id, name FROM domains ORDER BY name');
        const domainMap = {};
        domains.forEach(d => { domainMap[d.name.toLowerCase()] = d.id; });

        console.log('Found domains:', Object.keys(domainMap).join(', '));

        const seedData = [
            // Artificial Intelligence
            { domain: 'artificial intelligence', checkpoints: [
                { phase: 'Phase 1', title: 'Python & Math Foundations', description: 'Python programming basics\nNumPy & Pandas for data\nLinear Algebra essentials\nProbability & Statistics', sort_order: 1 },
                { phase: 'Phase 2', title: 'Data Analysis & Visualization', description: 'Exploratory Data Analysis\nMatplotlib & Seaborn\nData cleaning techniques\nFeature engineering', sort_order: 2 },
                { phase: 'Phase 3', title: 'Machine Learning', description: 'Supervised learning algorithms\nModel evaluation & tuning\nScikit-learn mastery\nRegression & Classification', sort_order: 3 },
                { phase: 'Phase 4', title: 'Deep Learning', description: 'Neural network fundamentals\nTensorFlow / PyTorch\nCNNs for Computer Vision\nRNNs & Transformers for NLP', sort_order: 4 },
                { phase: 'Phase 5', title: 'AI Projects & Research', description: 'End-to-end ML pipelines\nModel deployment (Flask/FastAPI)\nKaggle competitions\nResearch paper implementations', sort_order: 5 },
            ]},
            // Cloud Computing
            { domain: 'cloud computing', checkpoints: [
                { phase: 'Phase 1', title: 'Linux & Networking Basics', description: 'Linux CLI fundamentals\nFile systems & permissions\nNetworking (TCP/IP, DNS, HTTP)\nShell scripting', sort_order: 1 },
                { phase: 'Phase 2', title: 'Cloud Platform Fundamentals', description: 'AWS / GCP / Azure basics\nCompute (EC2, VMs)\nStorage (S3, Blob)\nIAM & Security groups', sort_order: 2 },
                { phase: 'Phase 3', title: 'Cloud Architecture', description: 'Load balancing & auto-scaling\nVPC & networking\nDatabase services (RDS, DynamoDB)\nServerless (Lambda, Functions)', sort_order: 3 },
                { phase: 'Phase 4', title: 'Containers & Orchestration', description: 'Docker fundamentals\nKubernetes basics\nContainer registries\nHelm charts & deployments', sort_order: 4 },
                { phase: 'Phase 5', title: 'DevOps & Deployment', description: 'CI/CD pipelines\nInfrastructure as Code (Terraform)\nMonitoring & logging\nCloud certifications prep', sort_order: 5 },
            ]},
            // Cybersecurity
            { domain: 'cybersecurity', checkpoints: [
                { phase: 'Phase 1', title: 'Networking & Linux', description: 'TCP/IP & OSI model\nLinux administration\nNetwork scanning (Nmap)\nWireshark packet analysis', sort_order: 1 },
                { phase: 'Phase 2', title: 'Cryptography & Security', description: 'Encryption algorithms\nHashing & digital signatures\nPKI & certificates\nSecure communications', sort_order: 2 },
                { phase: 'Phase 3', title: 'Ethical Hacking', description: 'Penetration testing methodology\nOWASP Top 10\nWeb app security testing\nBurp Suite & Metasploit', sort_order: 3 },
                { phase: 'Phase 4', title: 'Advanced Attacks & Defense', description: 'Privilege escalation\nReverse engineering basics\nMalware analysis\nFirewall & IDS/IPS config', sort_order: 4 },
                { phase: 'Phase 5', title: 'CTF & Certifications', description: 'Capture The Flag challenges\nBug bounty programs\nCEH / CompTIA Security+\nSecurity audit reports', sort_order: 5 },
            ]},
            // DevOps
            { domain: 'devops', checkpoints: [
                { phase: 'Phase 1', title: 'Version Control & Git', description: 'Git fundamentals & workflow\nBranching strategies\nGitHub/GitLab collaboration\nCode review practices', sort_order: 1 },
                { phase: 'Phase 2', title: 'Containerization', description: 'Docker concepts & images\nDockerfile best practices\nDocker Compose\nContainer networking', sort_order: 2 },
                { phase: 'Phase 3', title: 'CI/CD Pipelines', description: 'Jenkins / GitHub Actions\nAutomated testing\nBuild & deploy automation\nArtifact management', sort_order: 3 },
                { phase: 'Phase 4', title: 'Orchestration & Infra', description: 'Kubernetes deep dive\nTerraform & Ansible\nInfrastructure as Code\nService mesh concepts', sort_order: 4 },
                { phase: 'Phase 5', title: 'Monitoring & SRE', description: 'Prometheus & Grafana\nLog aggregation (ELK)\nIncident management\nSite Reliability Engineering', sort_order: 5 },
            ]},
            // Mobile Development
            { domain: 'mobile development', checkpoints: [
                { phase: 'Phase 1', title: 'Programming Fundamentals', description: 'Dart / Kotlin basics\nOOP concepts\nData structures\nDevelopment environment setup', sort_order: 1 },
                { phase: 'Phase 2', title: 'UI Development', description: 'Flutter widgets / Android XML\nLayouts & navigation\nMaterial Design principles\nResponsive UI patterns', sort_order: 2 },
                { phase: 'Phase 3', title: 'APIs & Data', description: 'REST API integration\nJSON parsing\nLocal storage (SQLite/Hive)\nState management patterns', sort_order: 3 },
                { phase: 'Phase 4', title: 'Advanced Features', description: 'Firebase integration\nPush notifications\nCamera & sensors\nMaps & location services', sort_order: 4 },
                { phase: 'Phase 5', title: 'Publishing & Beyond', description: 'App Store optimization\nPlay Store / App Store publishing\nCI/CD for mobile\nMonetization strategies', sort_order: 5 },
            ]},
            // Web Development
            { domain: 'web development', checkpoints: [
                { phase: 'Phase 1', title: 'HTML & CSS Foundations', description: 'Semantic HTML5 elements\nCSS Box Model & Flexbox\nResponsive Design principles\nCSS Grid layouts', sort_order: 1 },
                { phase: 'Phase 2', title: 'JavaScript Essentials', description: 'Core JS syntax & ES6+\nDOM manipulation\nAsync/Await & Fetch API\nEvent handling & forms', sort_order: 2 },
                { phase: 'Phase 3', title: 'Frontend Frameworks', description: 'React.js fundamentals\nComponent lifecycle & hooks\nState management (Context/Redux)\nRouting & SPA concepts', sort_order: 3 },
                { phase: 'Phase 4', title: 'Backend Development', description: 'Node.js & Express.js\nREST API design\nDatabase integration (SQL/NoSQL)\nAuthentication & JWT', sort_order: 4 },
                { phase: 'Phase 5', title: 'Full Stack Projects', description: 'Build end-to-end applications\nDeployment (Vercel/Netlify)\nPerformance optimization\nPortfolio & open source', sort_order: 5 },
            ]},
        ];

        for (const entry of seedData) {
            const domainId = domainMap[entry.domain];
            if (!domainId) {
                console.log(`⚠ Domain "${entry.domain}" not found, skipping`);
                continue;
            }

            for (const cp of entry.checkpoints) {
                await db.query(
                    'INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES (?, ?, ?, ?, ?)',
                    [domainId, cp.phase, cp.title, cp.description, cp.sort_order]
                );
            }
            console.log(`✓ Seeded ${entry.checkpoints.length} checkpoints for "${entry.domain}"`);
        }

        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
