-- SkillSphere Database Schema
CREATE DATABASE IF NOT EXISTS skillsphere_db;
USE skillsphere_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
    domain VARCHAR(100) DEFAULT NULL,
    credits INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roadmap TEXT,
    keywords TEXT
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    domain VARCHAR(100),
    assigned_to INT,
    assigned_by INT,
    status ENUM('pending', 'submitted', 'completed', 'rejected') DEFAULT 'pending',
    points INT DEFAULT 10,
    feedback TEXT DEFAULT NULL,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Task Proofs Table (photo verification)
CREATE TABLE IF NOT EXISTS task_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    points INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========== SEED DATA ==========

-- Default Domains (with keywords for AI recommendation)
INSERT INTO domains (name, roadmap, keywords) VALUES
('Web Development', 'HTML/CSS → JavaScript → React/Node.js → Full Stack Projects', 'html,css,javascript,react,nodejs,frontend,backend,website,design,ui,ux,responsive,web,fullstack,angular,vue,bootstrap,tailwind,api,rest'),
('Artificial Intelligence', 'Python Basics → NumPy/Pandas → ML Algorithms → Deep Learning → Projects', 'python,machine learning,deep learning,neural network,ai,data,analysis,tensorflow,pytorch,nlp,computer vision,automation,prediction,model,algorithm,math,statistics'),
('Cloud Computing', 'Linux Basics → AWS/GCP Fundamentals → Networking → Deployment → DevOps', 'aws,azure,gcp,cloud,server,deployment,infrastructure,linux,networking,scalability,virtualization,containers,serverless,microservices,iaas,paas,saas'),
('DevOps', 'Git → Docker → CI/CD → Kubernetes → Monitoring', 'docker,kubernetes,ci,cd,pipeline,git,jenkins,automation,monitoring,deployment,terraform,ansible,linux,shell,scripting,infrastructure,agile,continuous'),
('Cybersecurity', 'Networking → Linux → Cryptography → Ethical Hacking → CTF Challenges', 'security,hacking,ethical,penetration,testing,cryptography,firewall,vulnerability,network,linux,ctf,malware,forensics,encryption,privacy,threat,audit'),
('Mobile Development', 'Dart/Kotlin Basics → Flutter/Android → APIs → State Management → App Publishing', 'mobile,android,ios,flutter,dart,kotlin,swift,react native,app,phone,tablet,ui,responsive,play store,app store,cross platform,native');

-- Roadmap Checkpoints Table (structured roadmap data)
CREATE TABLE IF NOT EXISTS roadmap_checkpoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    phase VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Seed Roadmap Checkpoints
-- Web Development (domain_id = 1)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(1, 'Phase 1', 'HTML & CSS Foundations', 'Semantic HTML5 elements\nCSS Box Model & Flexbox\nResponsive Design principles\nCSS Grid layouts', 1),
(1, 'Phase 2', 'JavaScript Essentials', 'Core JS syntax & ES6+\nDOM manipulation\nAsync/Await & Fetch API\nEvent handling & forms', 2),
(1, 'Phase 3', 'Frontend Frameworks', 'React.js fundamentals\nComponent lifecycle & hooks\nState management (Context/Redux)\nRouting & SPA concepts', 3),
(1, 'Phase 4', 'Backend Development', 'Node.js & Express.js\nREST API design\nDatabase integration (SQL/NoSQL)\nAuthentication & JWT', 4),
(1, 'Phase 5', 'Full Stack Projects', 'Build end-to-end applications\nDeployment (Vercel/Netlify)\nPerformance optimization\nPortfolio & open source', 5);

-- Artificial Intelligence (domain_id = 2)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(2, 'Phase 1', 'Python & Math Foundations', 'Python programming basics\nNumPy & Pandas for data\nLinear Algebra essentials\nProbability & Statistics', 1),
(2, 'Phase 2', 'Data Analysis & Visualization', 'Exploratory Data Analysis\nMatplotlib & Seaborn\nData cleaning techniques\nFeature engineering', 2),
(2, 'Phase 3', 'Machine Learning', 'Supervised learning algorithms\nModel evaluation & tuning\nScikit-learn mastery\nRegression & Classification', 3),
(2, 'Phase 4', 'Deep Learning', 'Neural network fundamentals\nTensorFlow / PyTorch\nCNNs for Computer Vision\nRNNs & Transformers for NLP', 4),
(2, 'Phase 5', 'AI Projects & Research', 'End-to-end ML pipelines\nModel deployment (Flask/FastAPI)\nKaggle competitions\nResearch paper implementations', 5);

-- Cloud Computing (domain_id = 3)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(3, 'Phase 1', 'Linux & Networking Basics', 'Linux CLI fundamentals\nFile systems & permissions\nNetworking (TCP/IP, DNS, HTTP)\nShell scripting', 1),
(3, 'Phase 2', 'Cloud Platform Fundamentals', 'AWS / GCP / Azure basics\nCompute (EC2, VMs)\nStorage (S3, Blob)\nIAM & Security groups', 2),
(3, 'Phase 3', 'Cloud Architecture', 'Load balancing & auto-scaling\nVPC & networking\nDatabase services (RDS, DynamoDB)\nServerless (Lambda, Functions)', 3),
(3, 'Phase 4', 'Containers & Orchestration', 'Docker fundamentals\nKubernetes basics\nContainer registries\nHelm charts & deployments', 4),
(3, 'Phase 5', 'DevOps & Deployment', 'CI/CD pipelines\nInfrastructure as Code (Terraform)\nMonitoring & logging\nCloud certifications prep', 5);

-- DevOps (domain_id = 4)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(4, 'Phase 1', 'Version Control & Git', 'Git fundamentals & workflow\nBranching strategies\nGitHub/GitLab collaboration\nCode review practices', 1),
(4, 'Phase 2', 'Containerization', 'Docker concepts & images\nDockerfile best practices\nDocker Compose\nContainer networking', 2),
(4, 'Phase 3', 'CI/CD Pipelines', 'Jenkins / GitHub Actions\nAutomated testing\nBuild & deploy automation\nArtifact management', 3),
(4, 'Phase 4', 'Orchestration & Infra', 'Kubernetes deep dive\nTerraform & Ansible\nInfrastructure as Code\nService mesh concepts', 4),
(4, 'Phase 5', 'Monitoring & SRE', 'Prometheus & Grafana\nLog aggregation (ELK)\nIncident management\nSite Reliability Engineering', 5);

-- Cybersecurity (domain_id = 5)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(5, 'Phase 1', 'Networking & Linux', 'TCP/IP & OSI model\nLinux administration\nNetwork scanning (Nmap)\nWireshark packet analysis', 1),
(5, 'Phase 2', 'Cryptography & Security', 'Encryption algorithms\nHashing & digital signatures\nPKI & certificates\nSecure communications', 2),
(5, 'Phase 3', 'Ethical Hacking', 'Penetration testing methodology\nOWASP Top 10\nWeb app security testing\nBurp Suite & Metasploit', 3),
(5, 'Phase 4', 'Advanced Attacks & Defense', 'Privilege escalation\nReverse engineering basics\nMalware analysis\nFirewall & IDS/IPS config', 4),
(5, 'Phase 5', 'CTF & Certifications', 'Capture The Flag challenges\nBug bounty programs\nCEH / CompTIA Security+\nSecurity audit reports', 5);

-- Mobile Development (domain_id = 6)
INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES
(6, 'Phase 1', 'Programming Fundamentals', 'Dart / Kotlin basics\nOOP concepts\nData structures\nDevelopment environment setup', 1),
(6, 'Phase 2', 'UI Development', 'Flutter widgets / Android XML\nLayouts & navigation\nMaterial Design principles\nResponsive UI patterns', 2),
(6, 'Phase 3', 'APIs & Data', 'REST API integration\nJSON parsing\nLocal storage (SQLite/Hive)\nState management patterns', 3),
(6, 'Phase 4', 'Advanced Features', 'Firebase integration\nPush notifications\nCamera & sensors\nMaps & location services', 4),
(6, 'Phase 5', 'Publishing & Beyond', 'App Store optimization\nPlay Store / App Store publishing\nCI/CD for mobile\nMonetization strategies', 5);

-- ========== MIGRATION for existing databases ==========
-- Run these if you already have the database set up:
--
-- CREATE TABLE IF NOT EXISTS roadmap_checkpoints (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     domain_id INT NOT NULL,
--     phase VARCHAR(50) NOT NULL,
--     title VARCHAR(200) NOT NULL,
--     description TEXT,
--     sort_order INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
-- );
--
-- Then run the INSERT statements above to seed the checkpoints.
