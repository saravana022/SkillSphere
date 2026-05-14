const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
// const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ======================== MULTER CONFIG ========================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `proof-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowed.test(file.mimetype);
        if (extOk && mimeOk) cb(null, true);
        else cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
});

// ======================== AUTH ========================

// POST /api/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, domain } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'student';

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, domain) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, domain || null]
        );

        // Create leaderboard entry for students
        if (userRole === 'student') {
            await db.query('INSERT INTO leaderboard (user_id, points) VALUES (?, 0)', [result.insertId]);
        }

        res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, domain: user.domain, credits: user.credits }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== AI DOMAIN RECOMMENDATION ========================

// POST /api/ai/recommend
router.post('/ai/recommend', async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers) || answers.length < 3) {
            return res.status(400).json({ error: 'Please answer all questions' });
        }

        // Fetch domains with keywords
        const [domains] = await db.query('SELECT * FROM domains ORDER BY name');

        // Build scoring for each domain
        const scored = domains.map(domain => {
            let score = 0;
            const keywords = (domain.keywords || '').toLowerCase().split(',').map(k => k.trim());
            const domainNameLower = domain.name.toLowerCase();

            // Combine all answers into a single lowercase string for matching
            const allAnswers = answers.map(a => (a || '').toLowerCase()).join(' ');

            // 1. Keyword match scoring (most important)
            keywords.forEach(keyword => {
                if (keyword && allAnswers.includes(keyword)) {
                    score += 15;
                }
            });

            // 2. Domain name match
            if (allAnswers.includes(domainNameLower)) {
                score += 25;
            }

            // 3. Interest category scoring (Q1 — "What interests you most?")
            const q1 = (answers[0] || '').toLowerCase();
            const interestMap = {
                'web development': ['website', 'web', 'frontend', 'design', 'ui', 'building websites', 'interactive', 'visual'],
                'artificial intelligence': ['ai', 'data', 'machine learning', 'prediction', 'automation', 'intelligent', 'smart', 'analysis', 'solving puzzles', 'data puzzles'],
                'cloud computing': ['cloud', 'server', 'infrastructure', 'deployment', 'scalable', 'scale'],
                'devops': ['automation', 'pipeline', 'workflow', 'deployment', 'ci/cd', 'efficient', 'streamline', 'tools'],
                'cybersecurity': ['security', 'hacking', 'protect', 'privacy', 'securing', 'vulnerabilities', 'ethical', 'defense'],
                'mobile development': ['mobile', 'app', 'android', 'ios', 'phone', 'tablet', 'building apps']
            };
            const interestWords = interestMap[domainNameLower] || [];
            interestWords.forEach(word => {
                if (q1.includes(word)) score += 20;
            });

            // 4. Work style scoring (Q3 — "What do you enjoy more?")
            const q3 = (answers[2] || '').toLowerCase();
            const styleMap = {
                'web development': ['creative', 'visual', 'design', 'artistic'],
                'artificial intelligence': ['logical', 'problem-solving', 'analytical', 'math', 'research'],
                'cloud computing': ['infrastructure', 'systems', 'architecture', 'planning'],
                'devops': ['automation', 'systems', 'tools', 'efficiency', 'processes'],
                'cybersecurity': ['analytical', 'investigation', 'detective', 'problem-solving', 'puzzle'],
                'mobile development': ['creative', 'visual', 'user experience', 'products']
            };
            const styleWords = styleMap[domainNameLower] || [];
            styleWords.forEach(word => {
                if (q3.includes(word)) score += 15;
            });

            // 5. Scenario/excitement scoring (Q4 — "Pick one that excites you")
            if (answers[3]) {
                const q4 = (answers[3] || '').toLowerCase();
                const scenarioMap = {
                    'web development': ['portfolio', 'website', 'web app', 'online store', 'landing page'],
                    'artificial intelligence': ['predict', 'chatbot', 'recommendation', 'classify', 'neural', 'model'],
                    'cloud computing': ['deploy', 'server', 'scale', 'cloud', 'host', 'aws'],
                    'devops': ['automate', 'pipeline', 'docker', 'deploy', 'ci/cd', 'monitor'],
                    'cybersecurity': ['hack', 'vulnerability', 'ctf', 'firewall', 'penetration', 'secure'],
                    'mobile development': ['app', 'mobile', 'android', 'ios', 'play store', 'phone']
                };
                const scenarioWords = scenarioMap[domainNameLower] || [];
                scenarioWords.forEach(word => {
                    if (q4.includes(word)) score += 20;
                });
            }

            // 6. Dynamic Roadmap & Keyword Scoring for custom domains
            const roadmapStr = (domain.roadmap || '').toLowerCase().replace(/[^\w\s]/g, ' ');
            const roadmapWords = roadmapStr.split(/\s+/).filter(w => w.length > 3);
            const keywordList = (domain.keywords || '').toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
            const matchPool = [...new Set([...keywordList, ...roadmapWords])];
            
            matchPool.forEach(word => {
                if (allAnswers.includes(word)) {
                    score += 10;
                }
            });

            // Generate a reason based on the match
            let reason = '';
            if (score >= 50) {
                reason = `Strong match! Your interests closely align with ${domain.name}.`;
            } else if (score >= 30) {
                reason = `Good fit based on your preferred work style and interests.`;
            } else if (score >= 15) {
                reason = `You might enjoy exploring ${domain.name} based on your responses.`;
            } else {
                reason = `${domain.name} could broaden your skill set.`;
            }

            return {
                id: domain.id,
                name: domain.name,
                roadmap: domain.roadmap,
                score,
                matchPercent: 0, // will calculate after sorting
                reason
            };
        });

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        // Calculate match percentages relative to top score
        const maxScore = scored[0]?.score || 1;
        scored.forEach(d => {
            d.matchPercent = Math.min(98, Math.max(20, Math.round((d.score / Math.max(maxScore, 1)) * 95)));
        });

        // Ensure top result has highest percentage
        if (scored.length > 0) scored[0].matchPercent = Math.max(scored[0].matchPercent, 85);

        // Return all domains sorted as recommendations instead of just top 3
        res.json({
            recommendations: scored
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== PROFILE ========================

// GET /api/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, domain, credits, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, domain } = req.body;
        await db.query('UPDATE users SET name = ?, domain = ? WHERE id = ?', [name || req.user.name, domain, req.user.id]);
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== USERS (Admin) ========================

// GET /api/users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, domain, credits, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/users/:id
router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ? AND id != ?', [req.params.id, req.user.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== TASKS ========================

// GET /api/tasks
router.get('/tasks', verifyToken, async (req, res) => {
    try {
        let query, params;

        if (req.user.role === 'student') {
            query = `SELECT t.*, u.name as assigned_by_name FROM tasks t 
                     LEFT JOIN users u ON t.assigned_by = u.id 
                     WHERE t.assigned_to = ? ORDER BY t.created_at DESC`;
            params = [req.user.id];
        } else if (req.user.role === 'mentor') {
            query = `SELECT t.*, u.name as assigned_to_name FROM tasks t 
                     LEFT JOIN users u ON t.assigned_to = u.id 
                     WHERE t.assigned_by = ? ORDER BY t.created_at DESC`;
            params = [req.user.id];
        } else {
            query = `SELECT t.*, u1.name as assigned_to_name, u2.name as assigned_by_name 
                     FROM tasks t 
                     LEFT JOIN users u1 ON t.assigned_to = u1.id 
                     LEFT JOIN users u2 ON t.assigned_by = u2.id 
                     ORDER BY t.created_at DESC`;
            params = [];
        }

        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tasks (mentor creates — can assign to a domain or a specific student)
router.post('/tasks', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { title, description, domain, assigned_to, points, deadline } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const pts = points || 10;

        // If no specific student selected, assign to ALL students in the chosen domain
        if (!assigned_to && domain) {
            const [students] = await db.query(
                'SELECT id FROM users WHERE role = "student" AND domain = ?', [domain]
            );
            if (students.length === 0) {
                return res.status(400).json({ error: 'No students found in this domain' });
            }
            const values = students.map(s => [title, description, domain, s.id, req.user.id, pts, deadline || null]);
            const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
            await db.query(
                `INSERT INTO tasks (title, description, domain, assigned_to, assigned_by, points, deadline) VALUES ${placeholders}`,
                values.flat()
            );
            res.status(201).json({ message: `Task assigned to ${students.length} students in ${domain}` });
        } else {
            await db.query(
                'INSERT INTO tasks (title, description, domain, assigned_to, assigned_by, points, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, description, domain, assigned_to || null, req.user.id, pts, deadline || null]
            );
            res.status(201).json({ message: 'Task created' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/submit (student submits with proof photos)
router.put('/tasks/:id/submit', verifyToken, upload.array('proofs', 3), async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ? AND assigned_to = ?', [req.params.id, req.user.id]);
        if (tasks.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = tasks[0];
        if (task.status === 'completed') return res.status(400).json({ error: 'Task already completed' });
        if (task.status === 'submitted') return res.status(400).json({ error: 'Task already submitted for review' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one proof photo' });
        }

        // Save proof file paths
        for (const file of req.files) {
            await db.query(
                'INSERT INTO task_proofs (task_id, file_path) VALUES (?, ?)',
                [req.params.id, `/uploads/${file.filename}`]
            );
        }

        // Update task status to submitted
        await db.query('UPDATE tasks SET status = "submitted" WHERE id = ?', [req.params.id]);

        res.json({ message: 'Task submitted for review!', photos: req.files.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/complete (legacy — kept for backward compatibility)
router.put('/tasks/:id/complete', verifyToken, async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ? AND assigned_to = ?', [req.params.id, req.user.id]);
        if (tasks.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = tasks[0];
        if (task.status === 'completed') return res.status(400).json({ error: 'Task already completed' });

        await db.query('UPDATE tasks SET status = "completed" WHERE id = ?', [req.params.id]);

        // Award credits & update leaderboard
        const pts = task.points || 10;
        await db.query('UPDATE users SET credits = credits + ? WHERE id = ?', [pts, req.user.id]);
        await db.query(
            'INSERT INTO leaderboard (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?',
            [req.user.id, pts, pts]
        );

        res.json({ message: 'Task completed!', points: pts });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/verify (mentor approves or rejects)
router.put('/tasks/:id/verify', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { action, feedback } = req.body; // action: 'approve' or 'reject'
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (tasks.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = tasks[0];
        if (task.status !== 'submitted') {
            return res.status(400).json({ error: 'Task is not in submitted state' });
        }

        if (action === 'approve') {
            await db.query('UPDATE tasks SET status = "completed", feedback = ? WHERE id = ?',
                [feedback || 'Approved ✓', req.params.id]);

            // Award credits & update leaderboard
            const pts = task.points || 10;
            await db.query('UPDATE users SET credits = credits + ? WHERE id = ?', [pts, task.assigned_to]);
            await db.query(
                'INSERT INTO leaderboard (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?',
                [task.assigned_to, pts, pts]
            );

            res.json({ message: 'Task approved! Points awarded.', points: pts });
        } else if (action === 'reject') {
            await db.query('UPDATE tasks SET status = "rejected", feedback = ? WHERE id = ?',
                [feedback || 'Rejected — please redo', req.params.id]);

            // Delete old proofs so student can resubmit
            await db.query('DELETE FROM task_proofs WHERE task_id = ?', [req.params.id]);

            res.json({ message: 'Task rejected. Student will be notified.' });
        } else {
            res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/resubmit (student resubmits a rejected task)
router.put('/tasks/:id/resubmit', verifyToken, upload.array('proofs', 3), async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ? AND assigned_to = ?', [req.params.id, req.user.id]);
        if (tasks.length === 0) return res.status(404).json({ error: 'Task not found' });

        const task = tasks[0];
        if (task.status !== 'rejected') {
            return res.status(400).json({ error: 'Only rejected tasks can be resubmitted' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one proof photo' });
        }

        // Save new proof file paths
        for (const file of req.files) {
            await db.query(
                'INSERT INTO task_proofs (task_id, file_path) VALUES (?, ?)',
                [req.params.id, `/uploads/${file.filename}`]
            );
        }

        // Update task status back to submitted, clear old feedback
        await db.query('UPDATE tasks SET status = "submitted", feedback = NULL WHERE id = ?', [req.params.id]);

        res.json({ message: 'Task resubmitted for review!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/tasks/:id/proofs (get proof photos for a task)
router.get('/tasks/:id/proofs', verifyToken, async (req, res) => {
    try {
        const [proofs] = await db.query('SELECT * FROM task_proofs WHERE task_id = ? ORDER BY uploaded_at ASC', [req.params.id]);
        res.json(proofs);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/feedback (mentor gives feedback)
router.put('/tasks/:id/feedback', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { feedback } = req.body;
        await db.query('UPDATE tasks SET feedback = ? WHERE id = ?', [feedback, req.params.id]);
        res.json({ message: 'Feedback added' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id (mentor edits task)
router.put('/tasks/:id', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { title, description, domain, points, deadline } = req.body;
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, domain = ?, points = ?, deadline = ? WHERE id = ? AND assigned_by = ?',
            [title, description, domain, points || 10, deadline || null, req.params.id, req.user.id]
        );
        res.json({ message: 'Task updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/tasks/:id (mentor deletes task)
router.delete('/tasks/:id', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id = ? AND assigned_by = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== DOMAINS ========================

// GET /api/domains
router.get('/domains', async (req, res) => {
    try {
        const [domains] = await db.query('SELECT * FROM domains ORDER BY name');
        res.json(domains);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/domains (admin)
router.post('/domains', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { name, roadmap } = req.body;
        if (!name) return res.status(400).json({ error: 'Domain name is required' });
        await db.query('INSERT INTO domains (name, roadmap) VALUES (?, ?)', [name, roadmap]);
        res.status(201).json({ message: 'Domain created' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/domains/:id (admin)
router.delete('/domains/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM domains WHERE id = ?', [req.params.id]);
        res.json({ message: 'Domain deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== ROADMAP CHECKPOINTS ========================

// GET /api/domains/:id/roadmap — Fetch all checkpoints for a domain
router.get('/domains/:id/roadmap', async (req, res) => {
    try {
        const [checkpoints] = await db.query(
            'SELECT * FROM roadmap_checkpoints WHERE domain_id = ? ORDER BY sort_order ASC',
            [req.params.id]
        );
        res.json(checkpoints);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/domains/:id/roadmap — Bulk update checkpoints (mentor/admin)
router.put('/domains/:id/roadmap', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { checkpoints } = req.body;
        if (!Array.isArray(checkpoints)) {
            return res.status(400).json({ error: 'Checkpoints must be an array' });
        }

        // Delete existing checkpoints for this domain
        await db.query('DELETE FROM roadmap_checkpoints WHERE domain_id = ?', [req.params.id]);

        // Insert new checkpoints
        if (checkpoints.length > 0) {
            const values = checkpoints.map((cp, i) => [
                req.params.id,
                cp.phase || `Phase ${i + 1}`,
                cp.title,
                cp.description || '',
                cp.sort_order !== undefined ? cp.sort_order : i + 1
            ]);
            const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
            await db.query(
                `INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES ${placeholders}`,
                values.flat()
            );
        }

        res.json({ message: 'Roadmap updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/domains/:id/roadmap/checkpoint — Add a single checkpoint (mentor/admin)
router.post('/domains/:id/roadmap/checkpoint', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const { phase, title, description, sort_order } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        // Get max sort_order for this domain
        const [[maxRow]] = await db.query(
            'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM roadmap_checkpoints WHERE domain_id = ?',
            [req.params.id]
        );
        const order = sort_order || (maxRow.maxOrder + 1);

        const [result] = await db.query(
            'INSERT INTO roadmap_checkpoints (domain_id, phase, title, description, sort_order) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, phase || `Phase ${order}`, title, description || '', order]
        );

        res.status(201).json({ message: 'Checkpoint added', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/roadmap/checkpoint/:id — Delete a checkpoint (mentor/admin)
router.delete('/roadmap/checkpoint/:id', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM roadmap_checkpoints WHERE id = ?', [req.params.id]);
        res.json({ message: 'Checkpoint deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== LEADERBOARD ========================

// GET /api/leaderboard
router.get('/leaderboard', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.name, u.domain, l.points 
             FROM leaderboard l 
             JOIN users u ON l.user_id = u.id 
             ORDER BY l.points DESC LIMIT 50`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== ANNOUNCEMENTS ========================

// GET /api/announcements
router.get('/announcements', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, u.name as author FROM announcements a 
             LEFT JOIN users u ON a.created_by = u.id 
             ORDER BY a.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/announcements (admin)
router.post('/announcements', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
        await db.query('INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)', [title, message, req.user.id]);
        res.status(201).json({ message: 'Announcement posted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/announcements/:id (admin)
router.delete('/announcements/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== STUDENTS LIST (for mentors) ========================

router.get('/students', verifyToken, requireRole('mentor', 'admin'), async (req, res) => {
    try {
        const [students] = await db.query(
            'SELECT id, name, email, domain, credits FROM users WHERE role = "student" ORDER BY name'
        );
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================== ANALYTICS (admin) ========================

router.get('/analytics', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM users WHERE role="student"');
        const [[{ totalMentors }]] = await db.query('SELECT COUNT(*) as totalMentors FROM users WHERE role="mentor"');
        const [[{ totalTasks }]] = await db.query('SELECT COUNT(*) as totalTasks FROM tasks');
        const [[{ completedTasks }]] = await db.query('SELECT COUNT(*) as completedTasks FROM tasks WHERE status="completed"');
        const [[{ totalDomains }]] = await db.query('SELECT COUNT(*) as totalDomains FROM domains');

        res.json({ totalUsers, totalStudents, totalMentors, totalTasks, completedTasks, totalDomains });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
