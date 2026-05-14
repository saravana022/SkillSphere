/**
 * SkillSphere Dashboard — Main App Logic
 */
(function () {
    'use strict';

    // ===== Auth Check =====
    const token = localStorage.getItem('ss_token');
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');
    if (!token || !user.id) { window.location.href = '/'; return; }

    const API = '/api';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    // ===== DOM =====
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebarNav');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const creditsBadge = document.getElementById('creditsBadge');
    const creditsCount = document.getElementById('creditsCount');
    const logoutBtn = document.getElementById('logoutBtn');

    // Setup user info
    userName.textContent = user.name;
    userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    userAvatar.textContent = user.name.charAt(0).toUpperCase();
    if (user.role === 'student') {
        creditsBadge.style.display = 'flex';
        creditsCount.textContent = user.credits || 0;
    }

    // ===== Sidebar Navigation Items by Role =====
    const roadmapIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>';

    const navConfig = {
        student: [
            { id: 'home', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
            { id: 'tasks', label: 'My Tasks', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
            { id: 'domains', label: 'Domains', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' },
            { id: 'roadmap', label: 'Roadmap', icon: roadmapIcon },
            { id: 'leaderboard', label: 'Leaderboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' },
            { id: 'progress', label: 'My Progress', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
        ],
        mentor: [
            { id: 'home', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
            { id: 'create-task', label: 'Create Task', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' },
            { id: 'tasks', label: 'My Tasks', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
            { id: 'roadmap', label: 'Roadmaps', icon: roadmapIcon },
            { id: 'students', label: 'Students', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' },
        ],
        admin: [
            { id: 'home', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
            { id: 'users', label: 'Manage Users', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
            { id: 'manage-domains', label: 'Manage Domains', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' },
            { id: 'roadmap', label: 'Roadmaps', icon: roadmapIcon },
            { id: 'announcements', label: 'Announcements', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' },
        ]
    };

    // Build sidebar nav
    function buildNav() {
        const items = navConfig[user.role] || navConfig.student;
        sidebarNav.innerHTML = '';
        items.forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'nav-item' + (i === 0 ? ' active' : '');
            el.dataset.view = item.id;
            el.innerHTML = `${item.icon}<span>${item.label}</span>`;
            el.addEventListener('click', () => navigateTo(item.id));
            sidebarNav.appendChild(el);
        });
    }

    // ===== Navigation =====
    function navigateTo(viewId) {
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Close mobile sidebar
        sidebar.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');

        // Load view
        contentArea.style.animation = 'none';
        contentArea.offsetHeight;
        contentArea.style.animation = 'fadeIn 0.4s ease';

        const views = {
            'home': loadHome,
            'tasks': loadTasks,
            'domains': loadDomains,
            'roadmap': loadRoadmapView,
            'leaderboard': loadLeaderboard,
            'progress': loadProgress,
            'create-task': loadCreateTask,
            'students': loadStudents,
            'users': loadUsers,
            'manage-domains': loadManageDomains,
            'announcements': loadAnnouncements,
        };

        const loader = views[viewId];
        if (loader) {
            pageTitle.textContent = (navConfig[user.role] || []).find(n => n.id === viewId)?.label || 'Dashboard';
            loader();
        }
    }

    // ===== API Helpers =====
    async function apiFetch(endpoint) {
        const res = await fetch(API + endpoint, { headers });
        if (res.status === 403 || res.status === 401) { localStorage.clear(); window.location.href = '/'; return []; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }
    async function apiPost(endpoint, body) {
        const res = await fetch(API + endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }
    async function apiPut(endpoint, body = {}) {
        const res = await fetch(API + endpoint, { method: 'PUT', headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }
    async function apiDelete(endpoint) {
        const res = await fetch(API + endpoint, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }

    async function apiPutFormData(endpoint, formData) {
        const res = await fetch(API + endpoint, { 
            method: 'PUT', 
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }

    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    function formatDate(d) {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function timeAgo(d) {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    // ===== DOMAIN ICONS =====
    const domainIcons = {
        'web development': '🌐', 'artificial intelligence': '🤖', 'cloud computing': '☁️',
        'devops': '⚙️', 'cybersecurity': '🔒', 'mobile development': '📱',
        'data science': '📊', 'blockchain': '🔗', 'game development': '🎮',
    };
    function getDomainIcon(name) { return domainIcons[(name || '').toLowerCase()] || '💡'; }
    const domainColors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e', '#fd79a8', '#00cec9', '#fab1a0'];
    function getDomainColor(i) { return domainColors[i % domainColors.length]; }

    // ===== VIEW: HOME =====
    async function loadHome() {
        if (user.role === 'admin') return loadAdminHome();

        const [tasks, announcements, profile] = await Promise.all([
            apiFetch('/tasks'),
            apiFetch('/announcements'),
            apiFetch('/profile')
        ]);

        if (profile.credits !== undefined && user.role === 'student') {
            creditsCount.textContent = profile.credits;
        }

        const pending = tasks.filter(t => t.status === 'pending').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const total = tasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        contentArea.innerHTML = `
            <div class="stats-grid">
                ${user.role === 'student' ? `
                <div class="stat-card">
                    <div class="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${profile.credits || 0}</span><span class="stat-label">Total Credits</span></div>
                </div>` : ''}
                <div class="stat-card">
                    <div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${pending}</span><span class="stat-label">Pending Tasks</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${completed}</span><span class="stat-label">Completed</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${progress}%</span><span class="stat-label">Progress</span></div>
                </div>
            </div>

            ${user.role === 'student' ? `
            <div class="section">
                <h3 class="section-title">📈 Your Progress</h3>
                <div class="card">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.82rem;font-weight:600;">${completed} of ${total} tasks</span>
                        <span style="font-size:0.82rem;color:var(--primary);font-weight:700;">${progress}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                    ${profile.domain ? `<p style="margin-top:12px;font-size:0.82rem;color:var(--text-secondary);">Domain: <strong>${profile.domain}</strong></p>` : '<p style="margin-top:12px;font-size:0.82rem;color:var(--warning);">⚠ No domain selected yet. Go to Domains to pick one!</p>'}
                </div>
            </div>` : ''}

            <div class="grid-2">
                <div class="section">
                    <h3 class="section-title">📋 Recent Tasks</h3>
                    ${tasks.length === 0 ? '<div class="card"><p style="color:var(--text-muted);font-size:0.85rem;">No tasks yet</p></div>' :
                    tasks.slice(0, 3).map(t => `
                        <div class="task-card ${t.status}">
                            <div class="task-title">${t.title}</div>
                            <div class="task-meta">
                                <span class="task-tag tag-${t.status}">${t.status}</span>
                                ${t.points ? `<span class="task-tag tag-points">${t.points} pts</span>` : ''}
                                <span class="task-deadline">${formatDate(t.deadline)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="section">
                    <h3 class="section-title">📢 Announcements</h3>
                    ${announcements.length === 0 ? '<div class="card"><p style="color:var(--text-muted);font-size:0.85rem;">No announcements</p></div>' :
                    announcements.slice(0, 3).map(a => `
                        <div class="announcement-card">
                            <div class="announcement-title">${a.title}</div>
                            <div class="announcement-msg">${a.message}</div>
                            <div class="announcement-time">${timeAgo(a.created_at)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===== VIEW: ADMIN HOME =====
    async function loadAdminHome() {
        const [analytics, announcements] = await Promise.all([
            apiFetch('/analytics'),
            apiFetch('/announcements')
        ]);

        contentArea.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${analytics.totalUsers}</span><span class="stat-label">Total Users</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${analytics.totalStudents}</span><span class="stat-label">Students</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${analytics.totalTasks}</span><span class="stat-label">Total Tasks</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><line x1="2" y1="12" x2="22" y2="12"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${analytics.totalDomains}</span><span class="stat-label">Domains</span></div>
                </div>
            </div>

            <div class="grid-2">
                <div class="section">
                    <h3 class="section-title">📊 Task Completion</h3>
                    <div class="card">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-size:0.82rem;font-weight:600;">${analytics.completedTasks} of ${analytics.totalTasks} completed</span>
                            <span style="font-size:0.82rem;color:var(--primary);font-weight:700;">${analytics.totalTasks > 0 ? Math.round((analytics.completedTasks/analytics.totalTasks)*100) : 0}%</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" style="width:${analytics.totalTasks > 0 ? (analytics.completedTasks/analytics.totalTasks)*100 : 0}%"></div></div>
                        <div style="display:flex;gap:20px;margin-top:16px;">
                            <div><span style="font-size:1.2rem;font-weight:700;">${analytics.totalMentors}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Mentors</span></div>
                            <div><span style="font-size:1.2rem;font-weight:700;">${analytics.completedTasks}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Completed</span></div>
                            <div><span style="font-size:1.2rem;font-weight:700;">${analytics.totalTasks - analytics.completedTasks}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Pending</span></div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h3 class="section-title">📢 Recent Announcements</h3>
                    ${announcements.length === 0 ? '<div class="card"><p style="color:var(--text-muted);font-size:0.85rem;">No announcements yet</p></div>' :
                    announcements.slice(0, 3).map(a => `
                        <div class="announcement-card">
                            <div class="announcement-title">${a.title}</div>
                            <div class="announcement-msg">${a.message}</div>
                            <div class="announcement-time">${timeAgo(a.created_at)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===== VIEW: TASKS =====
    async function loadTasks() {
        const tasks = await apiFetch('/tasks');

        contentArea.innerHTML = `
            <div class="section">
                ${tasks.length === 0 ? `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        <p>No tasks assigned yet</p>
                    </div>
                ` : `
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        ${tasks.map(t => `
                            <div class="task-card ${t.status}" id="taskCard-${t.id}">
                                <div class="task-card-content" id="taskContent-${t.id}">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                                        <div style="flex:1;">
                                            <div class="task-title">${t.title}</div>
                                            <div class="task-desc">${t.description || 'No description'}</div>
                                        </div>
                                        ${user.role === 'mentor' ? `
                                        <div style="display:flex;gap:6px;flex-shrink:0;">
                                            <button class="btn btn-outline btn-sm edit-task-btn" data-id="${t.id}" title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                Edit
                                            </button>
                                            <button class="btn btn-danger btn-sm delete-task-btn" data-id="${t.id}" title="Delete">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                Delete
                                            </button>
                                        </div>
                                        ` : ''}
                                    </div>
                                    <div class="task-meta" style="margin-top:10px;">
                                        ${t.domain ? `<span class="task-tag tag-domain">${t.domain}</span>` : ''}
                                        <span class="task-tag tag-${t.status}">${t.status}</span>
                                        ${t.points ? `<span class="task-tag tag-points">${t.points} pts</span>` : ''}
                                        ${t.assigned_to_name ? `<span class="task-tag" style="background:var(--bg);color:var(--text-2,#555);">→ ${t.assigned_to_name}</span>` : ''}
                                        <span class="task-deadline">${formatDate(t.deadline)}</span>
                                    </div>
                                    ${t.feedback ? `<div class="task-feedback">💬 ${t.feedback}</div>` : ''}
                                    
                                    ${user.role === 'student' && t.status === 'pending' ? `
                                        <div style="margin-top:14px;">
                                            <button class="btn btn-primary btn-sm submit-proof-btn" data-id="${t.id}" data-action="submit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                Submit Proof
                                            </button>
                                        </div>
                                    ` : ''}

                                    ${user.role === 'student' && t.status === 'rejected' ? `
                                        <div style="margin-top:14px;">
                                            <button class="btn btn-danger btn-sm submit-proof-btn" data-id="${t.id}" data-action="resubmit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                Resubmit Proof
                                            </button>
                                        </div>
                                    ` : ''}

                                    ${user.role === 'mentor' && t.status === 'submitted' ? `
                                        <div style="margin-top:14px;">
                                            <button class="btn btn-info btn-sm review-proofs-btn" data-id="${t.id}" style="background:var(--info);color:white;">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                Review Proofs
                                            </button>
                                        </div>
                                    ` : ''}

                                    ${user.role === 'mentor' && t.status === 'completed' && !t.feedback ? `
                                        <div style="margin-top:14px;display:flex;gap:8px;">
                                            <input type="text" class="form-input feedback-input" data-id="${t.id}" placeholder="Write feedback..." style="flex:1;">
                                            <button class="btn btn-primary btn-sm feedback-btn" data-id="${t.id}">Send</button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            <!-- Modals Container -->
            <div id="modalsContainer"></div>
        `;

        // Modals Container Reference
        const modalsContainer = document.getElementById('modalsContainer');

        // ==== STUDENT: Upload Proofs ====
        contentArea.querySelectorAll('.submit-proof-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.dataset.id;
                const action = btn.dataset.action; // 'submit' or 'resubmit'
                
                modalsContainer.innerHTML = `
                    <div class="modal-overlay active" id="uploadModal">
                        <div class="custom-modal">
                            <div class="modal-header">
                                <h3>Upload Proof Photos</h3>
                                <button class="modal-close" id="closeUploadModal"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                            </div>
                            <div class="modal-body">
                                <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:16px;">
                                    Please upload 1 to 3 screenshots or photos showing you completed this task. (Max 5MB each)
                                </p>
                                <div class="upload-area" id="dropZone">
                                    <div class="upload-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                                    <div class="upload-text">Click or drag photos here</div>
                                    <div class="upload-hint">Supports JPG, PNG, WEBP</div>
                                    <input type="file" id="fileInput" multiple accept="image/*" style="display:none;">
                                </div>
                                <div class="file-preview-grid" id="filePreviewGrid"></div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-outline" id="cancelUploadBtn">Cancel</button>
                                <button class="btn btn-primary" id="confirmUploadBtn" disabled>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                const uploadModal = document.getElementById('uploadModal');
                const dropZone = document.getElementById('dropZone');
                const fileInput = document.getElementById('fileInput');
                const previewGrid = document.getElementById('filePreviewGrid');
                const confirmUploadBtn = document.getElementById('confirmUploadBtn');
                
                let selectedFiles = [];

                const closeModal = () => { uploadModal.classList.remove('active'); setTimeout(() => uploadModal.remove(), 300); };
                document.getElementById('closeUploadModal').onclick = closeModal;
                document.getElementById('cancelUploadBtn').onclick = closeModal;

                dropZone.onclick = () => fileInput.click();
                
                fileInput.onchange = (e) => handleFiles(e.target.files);

                function handleFiles(files) {
                    for (let f of files) {
                        if (selectedFiles.length >= 3) {
                            showToast('Maximum 3 photos allowed', 'error');
                            break;
                        }
                        if (f.size > 5 * 1024 * 1024) {
                            showToast(`${f.name} is larger than 5MB`, 'error');
                            continue;
                        }
                        selectedFiles.push(f);
                    }
                    renderPreviews();
                }

                function renderPreviews() {
                    previewGrid.innerHTML = '';
                    selectedFiles.forEach((file, index) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const div = document.createElement('div');
                            div.className = 'file-preview-item';
                            div.innerHTML = `
                                <img src="${e.target.result}" alt="Preview">
                                <button class="remove-file-btn" data-index="${index}">&times;</button>
                            `;
                            div.querySelector('.remove-file-btn').onclick = (event) => {
                                event.stopPropagation(); // prevent triggering dropZone onclick if inside it.
                                selectedFiles.splice(index, 1);
                                renderPreviews();
                            };
                            previewGrid.appendChild(div);
                        };
                        reader.readAsDataURL(file);
                    });
                    
                    confirmUploadBtn.disabled = selectedFiles.length === 0;
                }

                // Drag and drop events
                dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
                dropZone.ondragleave = () => dropZone.classList.remove('dragover');
                dropZone.ondrop = (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); };

                confirmUploadBtn.onclick = async () => {
                    if (selectedFiles.length === 0) return;
                    
                    confirmUploadBtn.disabled = true;
                    confirmUploadBtn.innerHTML = 'Uploading...';
                    
                    const formData = new FormData();
                    selectedFiles.forEach(f => formData.append('proofs', f));
                    
                    try {
                        const endpoint = action === 'resubmit' ? `/tasks/${taskId}/resubmit` : `/tasks/${taskId}/submit`;
                        const data = await apiPutFormData(endpoint, formData);
                        showToast(data.message || 'Task submitted successfully!');
                        closeModal();
                        loadTasks();
                    } catch (err) {
                        showToast(err.message || 'Action failed', 'error');
                        confirmUploadBtn.disabled = false;
                        confirmUploadBtn.innerHTML = 'Try Again';
                    }
                };
            });
        });

        // ==== MENTOR: Review Proofs ====
        contentArea.querySelectorAll('.review-proofs-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.dataset.id;
                
                // Fetch proofs
                btn.innerHTML = 'Loading...';
                const proofs = await apiFetch(`/tasks/${taskId}/proofs`);
                btn.innerHTML = 'Review Proofs';

                modalsContainer.innerHTML = `
                    <div class="modal-overlay active" id="reviewModal">
                        <div class="custom-modal" style="max-width: 650px;">
                            <div class="modal-header">
                                <h3>Review Student Proofs</h3>
                                <button class="modal-close" id="closeReviewModal"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                            </div>
                            <div class="modal-body">
                                <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:12px;">Student attached ${proofs.length} photos.</p>
                                <div class="proof-gallery">
                                    ${proofs.map(p => `
                                        <div class="proof-img-wrap" data-img="${p.file_path}">
                                            <img src="${p.file_path}" alt="Proof" loading="lazy">
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="form-group" style="margin-top: 24px; margin-bottom: 0;">
                                    <label class="form-label">Feedback (Optional)</label>
                                    <textarea class="form-textarea" id="reviewFeedback" placeholder="Great job! Or explain why you are rejecting..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer" style="justify-content: space-between;">
                                <div>
                                    <button class="btn btn-danger" id="rejectTaskBtn">Reject & Request Changes</button>
                                </div>
                                <button class="btn btn-success" id="approveTaskBtn">
                                    Approve & Award Points
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                const reviewModal = document.getElementById('reviewModal');
                const closeModal = () => { reviewModal.classList.remove('active'); setTimeout(() => reviewModal.remove(), 300); };
                document.getElementById('closeReviewModal').onclick = closeModal;

                // Lightbox logic
                document.querySelectorAll('.proof-img-wrap').forEach(wrap => {
                    wrap.onclick = () => {
                        const lightbox = document.createElement('div');
                        lightbox.className = 'lightbox active';
                        lightbox.innerHTML = `
                            <button class="lightbox-close">&times;</button>
                            <img class="lightbox-img" src="${wrap.dataset.img}" alt="Full size proof">
                        `;
                        lightbox.querySelector('.lightbox-close').onclick = () => lightbox.remove();
                        lightbox.onclick = (e) => { if(e.target === lightbox) lightbox.remove(); };
                        document.body.appendChild(lightbox);
                    };
                });

                const approveBtn = document.getElementById('approveTaskBtn');
                const rejectBtn = document.getElementById('rejectTaskBtn');
                const feedbackInput = document.getElementById('reviewFeedback');

                const submitReview = async (actionStr) => {
                    approveBtn.disabled = true;
                    rejectBtn.disabled = true;
                    try {
                        const data = await apiPut(`/tasks/${taskId}/verify`, {
                            action: actionStr,
                            feedback: feedbackInput.value.trim()
                        });
                        showToast(data.message);
                        closeModal();
                        loadTasks();
                    } catch (err) {
                        showToast(err.message || 'Action failed', 'error');
                        approveBtn.disabled = false;
                        rejectBtn.disabled = false;
                    }
                };

                approveBtn.onclick = () => submitReview('approve');
                rejectBtn.onclick = () => submitReview('reject');
            });
        });

        // Feedback buttons (mentor for completed tasks)
        contentArea.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const input = contentArea.querySelector(`.feedback-input[data-id="${btn.dataset.id}"]`);
                if (!input.value.trim()) return;
                await apiPut(`/tasks/${btn.dataset.id}/feedback`, { feedback: input.value.trim() });
                showToast('Feedback sent!');
                loadTasks();
            });
        });

        // Delete task buttons (mentor)
        contentArea.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this task?')) return;
                await apiDelete(`/tasks/${btn.dataset.id}`);
                showToast('Task deleted');
                loadTasks();
            });
        });

        // Edit task buttons (mentor) — inline edit form
        contentArea.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const task = tasks.find(t => t.id == id);
                if (!task) return;

                const domains = await apiFetch('/domains');
                const contentEl = document.getElementById(`taskContent-${id}`);

                contentEl.innerHTML = `
                    <form class="edit-task-form" data-id="${id}" style="display:flex;flex-direction:column;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-input" name="title" value="${task.title}" required>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label">Description</label>
                            <textarea class="form-textarea" name="description" style="min-height:60px;">${task.description || ''}</textarea>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                            <div class="form-group" style="margin:0;">
                                <label class="form-label">Domain</label>
                                <select class="form-select" name="domain">
                                    ${domains.map(d => `<option value="${d.name}" ${d.name === task.domain ? 'selected' : ''}>${d.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label class="form-label">Points</label>
                                <input type="number" class="form-input" name="points" value="${task.points || 10}" min="1" max="100">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label class="form-label">Deadline</label>
                                <input type="date" class="form-input" name="deadline" value="${task.deadline ? task.deadline.split('T')[0] : ''}">
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
                            <button type="button" class="btn btn-outline btn-sm cancel-edit-btn">Cancel</button>
                        </div>
                    </form>
                `;

                // Cancel
                contentEl.querySelector('.cancel-edit-btn').addEventListener('click', () => loadTasks());

                // Save
                contentEl.querySelector('.edit-task-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    await apiPut(`/tasks/${id}`, {
                        title: form.title.value,
                        description: form.description.value,
                        domain: form.domain.value,
                        points: parseInt(form.points.value) || 10,
                        deadline: form.deadline.value || null,
                    });
                    showToast('Task updated!');
                    loadTasks();
                });
            });
        });
    }

    // ===== VIEW: DOMAINS =====
    async function loadDomains() {
        const [domains, profile] = await Promise.all([apiFetch('/domains'), apiFetch('/profile')]);

        contentArea.innerHTML = `
            <div class="section">
                <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:18px;">
                    ${user.role === 'student' ? 'Select your learning domain and explore its roadmap.' : 'Available learning domains'}
                </p>
                <div class="grid-3">
                    ${domains.map((d, i) => `
                        <div class="domain-card ${profile.domain === d.name ? 'selected' : ''}" data-name="${d.name}" data-id="${d.id}">
                            <div class="domain-icon" style="background:${getDomainColor(i)}20;">
                                <span>${getDomainIcon(d.name)}</span>
                            </div>
                            <div class="domain-name">${d.name}</div>
                            <div class="domain-roadmap">${d.roadmap || 'Roadmap coming soon'}</div>
                            ${profile.domain === d.name ? '<div style="margin-top:10px;font-size:0.75rem;color:var(--primary);font-weight:600;">✓ Your Domain</div>' : ''}
                            <button class="domain-roadmap-btn" data-id="${d.id}" data-name="${d.name}" onclick="event.stopPropagation();">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
                                View Roadmap
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        if (user.role === 'student') {
            contentArea.querySelectorAll('.domain-card').forEach(card => {
                card.addEventListener('click', async () => {
                    const name = card.dataset.name;
                    await apiPut('/profile', { name: user.name, domain: name });
                    user.domain = name;
                    localStorage.setItem('ss_user', JSON.stringify(user));
                    showToast(`Domain set to ${name}!`);
                    loadDomains();
                });
            });
        }

        // View Roadmap buttons
        contentArea.querySelectorAll('.domain-roadmap-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const domainId = btn.dataset.id;
                const domainName = btn.dataset.name;
                loadRoadmapDisplay(domainId, domainName, false);
            });
        });
    }

    // ===== VIEW: ROADMAP (Nav item) =====
    async function loadRoadmapView() {
        if (user.role === 'student') {
            // Show student's currently selected domain roadmap, or domain picker
            const profile = await apiFetch('/profile');
            if (profile.domain) {
                // Find domain id
                const domains = await apiFetch('/domains');
                const myDomain = domains.find(d => d.name === profile.domain);
                if (myDomain) {
                    loadRoadmapDisplay(myDomain.id, myDomain.name, false);
                } else {
                    loadRoadmapDomainPicker();
                }
            } else {
                loadRoadmapDomainPicker();
            }
        } else {
            // Mentor/Admin: show domain picker + editable roadmap
            loadRoadmapEditor();
        }
    }

    // Domain picker when student has no domain
    async function loadRoadmapDomainPicker() {
        const domains = await apiFetch('/domains');
        contentArea.innerHTML = `
            <div class="roadmap-container">
                <div class="roadmap-header">
                    <div class="roadmap-header-left">
                        <div class="roadmap-header-icon">🗺️</div>
                        <div>
                            <div class="roadmap-title">Learning Roadmaps</div>
                            <div class="roadmap-subtitle">Select a domain to view its roadmap</div>
                        </div>
                    </div>
                </div>
                <div class="roadmap-domain-selector">
                    ${domains.map((d, i) => `
                        <button class="roadmap-domain-pill" data-id="${d.id}" data-name="${d.name}">
                            <span>${getDomainIcon(d.name)}</span>
                            ${d.name}
                        </button>
                    `).join('')}
                </div>
                <div class="roadmap-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
                    <p>Pick a domain above to explore its learning roadmap</p>
                    <span>Each domain has a structured path from beginner to advanced</span>
                </div>
            </div>
        `;

        contentArea.querySelectorAll('.roadmap-domain-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                loadRoadmapDisplay(pill.dataset.id, pill.dataset.name, false);
            });
        });
    }

    // ===== ROADMAP DISPLAY (Visual Map) =====
    async function loadRoadmapDisplay(domainId, domainName, canEdit) {
        const checkpoints = await apiFetch(`/domains/${domainId}/roadmap`);

        contentArea.innerHTML = `
            <div class="roadmap-container" id="roadmapContainer">
                <div class="roadmap-header">
                    <div class="roadmap-header-left">
                        <div class="roadmap-header-icon">${getDomainIcon(domainName)}</div>
                        <div>
                            <div class="roadmap-title">${domainName}</div>
                            <div class="roadmap-subtitle">Learning Path Checkpoints</div>
                        </div>
                    </div>
                    <button class="roadmap-back-btn" id="roadmapBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                        Back
                    </button>
                </div>

                ${checkpoints.length === 0 ? `
                    <div class="roadmap-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
                        <p>No roadmap checkpoints yet</p>
                        <span>Checkpoints will appear here once a mentor or admin adds them</span>
                    </div>
                ` : `
                    <div class="roadmap-map">
                        <svg class="roadmap-svg-layer"></svg>
                        <div class="roadmap-map-flow">
                            ${checkpoints.map((cp, i) => {
                                const descItems = (cp.description || '').split('\n').filter(line => line.trim());
                                return `
                                <div class="roadmap-checkpoint">
                                    <div class="roadmap-flag-pin">
                                        <div class="roadmap-flag-head">
                                            <span class="roadmap-flag-label">Q${i + 1}</span>
                                        </div>
                                        <div class="roadmap-flag-pole"></div>
                                        <div class="roadmap-flag-dot"></div>
                                    </div>
                                    
                                    <div class="roadmap-phase-heading">${cp.title}</div>
                                    
                                    <div class="roadmap-cp-card">
                                        ${descItems.length > 0 ? `
                                            <div class="roadmap-cp-items">
                                                ${descItems.map(item => `<div class="roadmap-cp-pill">${item}</div>`).join('')}
                                            </div>
                                        ` : '<div style="color:var(--text-muted);font-size:0.8rem">No details</div>'}
                                        
                                        ${canEdit ? `
                                            <div class="roadmap-phase-controls">
                                                <button class="roadmap-btn roadmap-btn-outline roadmap-btn-sm edit-cp-btn" data-id="${cp.id}" data-phase="${cp.phase}" data-title="${cp.title}" data-desc="${(cp.description || '').replace(/"/g, '&quot;')}" data-order="${cp.sort_order}">✏️ Edit</button>
                                                <button class="roadmap-btn roadmap-btn-danger roadmap-btn-sm delete-cp-btn" data-id="${cp.id}">🗑️ Delete</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                `}
            </div>
        `;

        // Dynamic SVG Path Routing
        setTimeout(() => {
            const svgLayer = document.querySelector('.roadmap-svg-layer');
            const dots = document.querySelectorAll('.roadmap-flag-dot');
            
            if (svgLayer && dots.length > 0) {
                const drawPath = () => {
                    const svgRect = svgLayer.getBoundingClientRect();
                    let pathData = "";
                    
                    dots.forEach((dot, index) => {
                        const rect = dot.getBoundingClientRect();
                        const x = rect.left - svgRect.left + (rect.width / 2);
                        const y = rect.top - svgRect.top + (rect.height / 2);
                        
                        if (index === 0) {
                            pathData += `M ${x},${y} `;
                        } else {
                            const prev = dots[index - 1].getBoundingClientRect();
                            const prevX = prev.left - svgRect.left + (prev.width / 2);
                            const prevY = prev.top - svgRect.top + (prev.height / 2);
                            
                            // Create a smooth winding bezier curve between points
                            const midY = (prevY + y) / 2;
                            pathData += `C ${prevX},${midY} ${x},${midY} ${x},${y} `;
                        }
                    });
                    
                    svgLayer.innerHTML = `<path d="${pathData}"></path>`;
                };

                drawPath();
                // Redraw on window resize
                window.addEventListener('resize', drawPath, { once: false });
            }
        }, 50);

        // Back button
        document.getElementById('roadmapBackBtn').addEventListener('click', () => {
            if (user.role === 'student') {
                navigateTo('domains');
            } else {
                loadRoadmapEditor();
            }
        });

        // Edit mode handlers
        if (canEdit) {
            contentArea.querySelectorAll('.delete-cp-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this checkpoint?')) return;
                    await apiDelete(`/roadmap/checkpoint/${btn.dataset.id}`);
                    showToast('Checkpoint deleted');
                    loadRoadmapDisplay(domainId, domainName, true);
                });
            });

            contentArea.querySelectorAll('.edit-cp-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cpCard = btn.closest('.roadmap-checkpoint');
                    // Replace entire checkpoint contents with edit form
                    cpCard.innerHTML = `
                        <div class="roadmap-edit-panel" style="margin-bottom:0">
                            <div class="roadmap-edit-title">Edit Checkpoint</div>
                            <form class="roadmap-edit-form" id="editCpForm-${btn.dataset.id}">
                                <input type="text" name="phase" value="${btn.dataset.phase}" placeholder="Phase label (e.g. Q1)">
                                <input type="text" name="title" value="${btn.dataset.title}" placeholder="Main Title" required>
                                <input type="number" name="sort_order" value="${btn.dataset.order}" placeholder="Order">
                                <textarea name="description" placeholder="Topics (one per line)">${btn.dataset.desc.replace(/&quot;/g, '"')}</textarea>
                            </form>
                            <div class="roadmap-edit-actions">
                                <button class="roadmap-btn roadmap-btn-primary roadmap-btn-sm save-edit-btn" data-id="${btn.dataset.id}">Save</button>
                                <button class="roadmap-btn roadmap-btn-outline roadmap-btn-sm cancel-edit-btn">Cancel</button>
                            </div>
                        </div>
                    `;

                    cpCard.querySelector('.cancel-edit-btn').addEventListener('click', () => {
                        loadRoadmapDisplay(domainId, domainName, true);
                    });

                    cpCard.querySelector('.save-edit-btn').addEventListener('click', async () => {
                        const form = cpCard.querySelector('form');
                        // Fetch all current checkpoints, update the edited one, and bulk update
                        const allCps = await apiFetch(`/domains/${domainId}/roadmap`);
                        const updatedCps = allCps.map(c => {
                            if (c.id == btn.dataset.id) {
                                return {
                                    phase: form.phase.value,
                                    title: form.title.value,
                                    description: form.description.value,
                                    sort_order: parseInt(form.sort_order.value) || c.sort_order
                                };
                            }
                            return { phase: c.phase, title: c.title, description: c.description, sort_order: c.sort_order };
                        });
                        await apiPut(`/domains/${domainId}/roadmap`, { checkpoints: updatedCps });
                        showToast('Checkpoint updated!');
                        loadRoadmapDisplay(domainId, domainName, true);
                    });
                });
            });
        }
    }

    // ===== ROADMAP EDITOR (Mentor/Admin) =====
    async function loadRoadmapEditor() {
        const domains = await apiFetch('/domains');

        contentArea.innerHTML = `
            <div class="roadmap-container" id="roadmapEditorContainer">
                <div class="roadmap-header">
                    <div class="roadmap-header-left">
                        <div class="roadmap-header-icon">🗺️</div>
                        <div>
                            <div class="roadmap-title">Manage Roadmaps</div>
                            <div class="roadmap-subtitle">Select a domain to view and edit its roadmap</div>
                        </div>
                    </div>
                </div>

                <div class="roadmap-domain-selector" id="roadmapDomainSelector">
                    ${domains.map((d, i) => `
                        <button class="roadmap-domain-pill" data-id="${d.id}" data-name="${d.name}">
                            <span>${getDomainIcon(d.name)}</span>
                            ${d.name}
                        </button>
                    `).join('')}
                </div>

                <div id="roadmapEditorContent">
                    <div class="roadmap-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
                        <p>Select a domain above to manage its roadmap</p>
                        <span>You can add, edit, and reorder checkpoints</span>
                    </div>
                </div>
            </div>
        `;

        contentArea.querySelectorAll('.roadmap-domain-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                // Set active state
                contentArea.querySelectorAll('.roadmap-domain-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                loadRoadmapEditorForDomain(pill.dataset.id, pill.dataset.name);
            });
        });
    }

    async function loadRoadmapEditorForDomain(domainId, domainName) {
        const checkpoints = await apiFetch(`/domains/${domainId}/roadmap`);
        const editorContent = document.getElementById('roadmapEditorContent');
        const phaseIcons = ['🚀', '📘', '⚡', '🔥', '🏆', '💎', '🌟', '🎯'];

        editorContent.innerHTML = `
            <!-- Add new checkpoint form -->
            <div class="roadmap-edit-panel">
                <div class="roadmap-edit-title">➕ Add New Checkpoint</div>
                <form class="roadmap-edit-form" id="addCheckpointForm">
                    <input type="text" name="phase" placeholder="Phase label (e.g., Phase 1)">
                    <input type="text" name="title" placeholder="Checkpoint title *" required>
                    <input type="number" name="sort_order" placeholder="Order" style="width:80px;">
                    <textarea name="description" placeholder="Description items (one per line)"></textarea>
                </form>
                <div class="roadmap-edit-actions">
                    <button class="roadmap-btn roadmap-btn-primary" id="addCheckpointBtn">Add Checkpoint</button>
                </div>
            </div>

            <!-- Existing checkpoints -->
            ${checkpoints.length === 0 ? `
                <div class="roadmap-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
                    <p>No checkpoints yet for ${domainName}</p>
                    <span>Use the form above to add the first checkpoint</span>
                </div>
            ` : `
                <div class="roadmap-timeline">
                    <div class="roadmap-road"></div>
                    ${checkpoints.map((cp, i) => {
                        const descItems = (cp.description || '').split('\n').filter(line => line.trim());
                        return `
                        <div class="roadmap-phase">
                            <div class="roadmap-flag">
                                <div class="roadmap-flag-marker">
                                    <span class="roadmap-flag-icon">${phaseIcons[i % phaseIcons.length]}</span>
                                    <span class="roadmap-flag-number">${i + 1}</span>
                                </div>
                            </div>
                            <div class="roadmap-phase-card">
                                <div class="roadmap-phase-label">${cp.phase}</div>
                                <div class="roadmap-phase-title">${cp.title}</div>
                                ${descItems.length > 0 ? `
                                    <div class="roadmap-phase-items">
                                        ${descItems.map(item => `<div class="roadmap-phase-item">${item}</div>`).join('')}
                                    </div>
                                ` : ''}
                                <div class="roadmap-phase-controls">
                                    <button class="roadmap-btn roadmap-btn-outline roadmap-btn-sm edit-cp-btn" data-id="${cp.id}" data-phase="${cp.phase}" data-title="${cp.title}" data-desc="${(cp.description || '').replace(/"/g, '&quot;')}" data-order="${cp.sort_order}">✏️ Edit</button>
                                    <button class="roadmap-btn roadmap-btn-danger roadmap-btn-sm delete-cp-btn" data-id="${cp.id}">🗑️ Delete</button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `}
        `;

        // Add checkpoint
        document.getElementById('addCheckpointBtn').addEventListener('click', async () => {
            const form = document.getElementById('addCheckpointForm');
            const title = form.title.value.trim();
            if (!title) { showToast('Title is required', 'error'); return; }

            await apiPost(`/domains/${domainId}/roadmap/checkpoint`, {
                phase: form.phase.value.trim() || null,
                title,
                description: form.description.value.trim(),
                sort_order: parseInt(form.sort_order.value) || null
            });
            showToast('Checkpoint added!');
            loadRoadmapEditorForDomain(domainId, domainName);
        });

        // Delete checkpoint
        editorContent.querySelectorAll('.delete-cp-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this checkpoint?')) return;
                await apiDelete(`/roadmap/checkpoint/${btn.dataset.id}`);
                showToast('Checkpoint deleted');
                loadRoadmapEditorForDomain(domainId, domainName);
            });
        });

        // Edit checkpoint inline
        editorContent.querySelectorAll('.edit-cp-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cpCard = btn.closest('.roadmap-phase-card');
                cpCard.innerHTML = `
                    <form class="roadmap-edit-form" id="editCpForm-${btn.dataset.id}">
                        <input type="text" name="phase" value="${btn.dataset.phase}" placeholder="Phase label">
                        <input type="text" name="title" value="${btn.dataset.title}" placeholder="Title" required>
                        <input type="number" name="sort_order" value="${btn.dataset.order}" placeholder="Order" style="width:80px;">
                        <textarea name="description" placeholder="Description (one item per line)">${btn.dataset.desc.replace(/&quot;/g, '"')}</textarea>
                    </form>
                    <div class="roadmap-edit-actions">
                        <button class="roadmap-btn roadmap-btn-primary roadmap-btn-sm save-edit-btn" data-id="${btn.dataset.id}">Save</button>
                        <button class="roadmap-btn roadmap-btn-outline roadmap-btn-sm cancel-edit-btn">Cancel</button>
                    </div>
                `;

                cpCard.querySelector('.cancel-edit-btn').addEventListener('click', () => {
                    loadRoadmapEditorForDomain(domainId, domainName);
                });

                cpCard.querySelector('.save-edit-btn').addEventListener('click', async () => {
                    const form = cpCard.querySelector('form');
                    const allCps = await apiFetch(`/domains/${domainId}/roadmap`);
                    const updatedCps = allCps.map(c => {
                        if (c.id == btn.dataset.id) {
                            return {
                                phase: form.phase.value,
                                title: form.title.value,
                                description: form.description.value,
                                sort_order: parseInt(form.sort_order.value) || c.sort_order
                            };
                        }
                        return { phase: c.phase, title: c.title, description: c.description, sort_order: c.sort_order };
                    });
                    await apiPut(`/domains/${domainId}/roadmap`, { checkpoints: updatedCps });
                    showToast('Checkpoint updated!');
                    loadRoadmapEditorForDomain(domainId, domainName);
                });
            });
        });
    }

    // ===== VIEW: LEADERBOARD =====
    async function loadLeaderboard() {
        const data = await apiFetch('/leaderboard');

        if (data.length === 0) {
            contentArea.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg><p>No leaderboard data yet</p></div>`;
            return;
        }

        const top3 = data.slice(0, 3);
        const maxPts = data[0]?.points || 1;

        // Find user rank
        const userRank = data.findIndex(r => r.id === user.id);

        contentArea.innerHTML = `
            <!-- Podium for top 3 -->
            <div class="card" style="overflow:visible;margin-bottom:24px;">
                <div class="card-header"><span class="card-title">🏆 Top Performers</span></div>
                <div class="podium-container">
                    ${top3.length >= 2 ? `
                    <div class="podium-item podium-2">
                        <div class="podium-avatar" style="background:linear-gradient(135deg,#c0c0c0,#808080);">${top3[1].name.charAt(0)}</div>
                        <div class="podium-name">${top3[1].name}</div>
                        <div class="podium-domain">${top3[1].domain || '—'}</div>
                        <div class="podium-pts">${top3[1].points} pts</div>
                        <div class="podium-block podium-block-2"><span>2</span></div>
                    </div>` : ''}
                    ${top3.length >= 1 ? `
                    <div class="podium-item podium-1">
                        <div class="podium-crown">👑</div>
                        <div class="podium-avatar" style="background:linear-gradient(135deg,#ffd700,#ff8c00);">${top3[0].name.charAt(0)}</div>
                        <div class="podium-name">${top3[0].name}</div>
                        <div class="podium-domain">${top3[0].domain || '—'}</div>
                        <div class="podium-pts">${top3[0].points} pts</div>
                        <div class="podium-block podium-block-1"><span>1</span></div>
                    </div>` : ''}
                    ${top3.length >= 3 ? `
                    <div class="podium-item podium-3">
                        <div class="podium-avatar" style="background:linear-gradient(135deg,#cd7f32,#8b4513);">${top3[2].name.charAt(0)}</div>
                        <div class="podium-name">${top3[2].name}</div>
                        <div class="podium-domain">${top3[2].domain || '—'}</div>
                        <div class="podium-pts">${top3[2].points} pts</div>
                        <div class="podium-block podium-block-3"><span>3</span></div>
                    </div>` : ''}
                </div>
            </div>

            <div class="grid-2">
                <!-- Chart -->
                <div class="card">
                    <div class="card-header"><span class="card-title">📊 Points Distribution</span></div>
                    <div style="position:relative;height:300px;">
                        <canvas id="leaderChart"></canvas>
                    </div>
                </div>

                <!-- Your Rank card -->
                <div class="card">
                    <div class="card-header"><span class="card-title">🎯 Your Position</span></div>
                    ${userRank >= 0 ? `
                    <div style="text-align:center;padding:20px 0;">
                        <div style="font-size:3rem;font-weight:800;color:var(--primary);line-height:1;">#${userRank + 1}</div>
                        <div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px;">out of ${data.length} students</div>
                        <div style="margin-top:20px;">
                            <div class="progress-bar" style="height:12px;max-width:240px;margin:0 auto;">
                                <div class="progress-fill" style="width:${Math.round((data[userRank].points / maxPts) * 100)}%"></div>
                            </div>
                            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:8px;">
                                ${data[userRank].points} / ${maxPts} pts (${Math.round((data[userRank].points / maxPts) * 100)}% of leader)
                            </div>
                        </div>
                        ${userRank > 0 ? `<div style="margin-top:16px;padding:10px 16px;background:var(--primary-bg);border-radius:var(--radius-sm);font-size:0.78rem;color:var(--primary);font-weight:600;">
                            ${data[userRank - 1].points - data[userRank].points} more pts to reach #${userRank}
                        </div>` : '<div style="margin-top:16px;padding:10px 16px;background:var(--success-bg);border-radius:var(--radius-sm);font-size:0.82rem;color:var(--success);font-weight:600;">🥇 You\'re the leader!</div>'}
                    </div>
                    ` : '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.85rem;">Complete tasks to appear on the leaderboard!</div>'}
                </div>
            </div>

            <!-- Full table -->
            <div class="card" style="margin-top:24px;">
                <div class="card-header"><span class="card-title">Full Rankings</span></div>
                <table class="leaderboard-table">
                    <thead><tr><th>Rank</th><th>Name</th><th>Domain</th><th>Points</th><th>Progress</th></tr></thead>
                    <tbody>
                        ${data.map((row, i) => `
                            <tr ${row.id === user.id ? 'style="background:var(--primary-bg);"' : ''}>
                                <td><span class="rank-badge ${i < 3 ? 'rank-' + (i+1) : 'rank-default'}">${i + 1}</span></td>
                                <td style="font-weight:600;">${row.name} ${row.id === user.id ? '<span style="font-size:0.7rem;color:var(--primary);">(You)</span>' : ''}</td>
                                <td>${row.domain || '—'}</td>
                                <td style="font-weight:700;color:var(--primary);">${row.points}</td>
                                <td style="width:120px;">
                                    <div class="progress-bar" style="height:6px;">
                                        <div class="progress-fill" style="width:${Math.round((row.points / maxPts) * 100)}%;animation:none;"></div>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Render chart
        const top10 = data.slice(0, 10);
        const ctx = document.getElementById('leaderChart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: top10.map(r => r.name.split(' ')[0]),
                    datasets: [{
                        label: 'Points',
                        data: top10.map(r => r.points),
                        backgroundColor: top10.map((r, i) => {
                            if (r.id === user.id) return 'rgba(108, 92, 231, 0.9)';
                            const colors = ['rgba(255,215,0,0.7)', 'rgba(192,192,192,0.7)', 'rgba(205,127,50,0.7)'];
                            return i < 3 ? colors[i] : 'rgba(108, 92, 231, 0.15)';
                        }),
                        borderColor: top10.map((r, i) => {
                            if (r.id === user.id) return '#6c5ce7';
                            return i < 3 ? ['#ffd700','#c0c0c0','#cd7f32'][i] : 'rgba(108,92,231,0.3)';
                        }),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a2e',
                            titleFont: { family: 'Inter', size: 13 },
                            bodyFont: { family: 'Inter', size: 12 },
                            padding: 12,
                            cornerRadius: 10,
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
                        y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12, weight: '600' } } }
                    }
                }
            });
        }
    }

    // ===== VIEW: PROGRESS (Student) =====
    async function loadProgress() {
        const [tasks, profile, leaderboard] = await Promise.all([
            apiFetch('/tasks'),
            apiFetch('/profile'),
            apiFetch('/leaderboard')
        ]);

        const completed = tasks.filter(t => t.status === 'completed');
        const pending = tasks.filter(t => t.status === 'pending');
        const total = tasks.length;
        const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
        const totalPts = completed.reduce((sum, t) => sum + (t.points || 0), 0);
        const pendingPts = pending.reduce((sum, t) => sum + (t.points || 0), 0);

        // Group tasks by domain
        const domainMap = {};
        tasks.forEach(t => {
            const d = t.domain || 'General';
            if (!domainMap[d]) domainMap[d] = { total: 0, done: 0, pts: 0 };
            domainMap[d].total++;
            if (t.status === 'completed') { domainMap[d].done++; domainMap[d].pts += (t.points || 0); }
        });
        const domainNames = Object.keys(domainMap);

        // User rank
        const userRank = leaderboard.findIndex(r => r.id === user.id);

        contentArea.innerHTML = `
            <!-- Stat cards row -->
            <div class="stats-grid" style="grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));">
                <div class="stat-card">
                    <div class="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${profile.credits || 0}</span><span class="stat-label">Total Credits</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${completed.length}</span><span class="stat-label">Completed</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                    <div class="stat-info"><span class="stat-number">${pending.length}</span><span class="stat-label">Pending</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
                    <div class="stat-info"><span class="stat-number">#${userRank >= 0 ? userRank + 1 : '—'}</span><span class="stat-label">Rank</span></div>
                </div>
            </div>

            <div class="grid-2">
                <!-- Doughnut chart -->
                <div class="card">
                    <div class="card-header"><span class="card-title">Task Completion</span></div>
                    <div style="position:relative;max-width:260px;margin:0 auto;">
                        <canvas id="progressDonut"></canvas>
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                            <div style="font-size:2rem;font-weight:800;color:var(--primary);line-height:1;">${progress}%</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">complete</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:20px;margin-top:18px;">
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;">
                            <span style="width:10px;height:10px;border-radius:50%;background:#6c5ce7;"></span> Done (${completed.length})
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;">
                            <span style="width:10px;height:10px;border-radius:50%;background:#e8e9f0;"></span> Pending (${pending.length})
                        </div>
                    </div>
                </div>

                <!-- Points breakdown bar chart -->
                <div class="card">
                    <div class="card-header"><span class="card-title">Points by Domain</span></div>
                    ${domainNames.length === 0 ? '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:40px;">Complete tasks to see your domain breakdown</p>' : `
                    <div style="position:relative;height:220px;">
                        <canvas id="domainChart"></canvas>
                    </div>
                    `}
                </div>
            </div>

            <!-- Domain progress breakdown -->
            ${domainNames.length > 0 ? `
            <div class="card" style="margin-top:24px;">
                <div class="card-header"><span class="card-title">📂 Domain Breakdown</span></div>
                <div style="display:flex;flex-direction:column;gap:18px;">
                    ${domainNames.map((d, i) => {
                        const info = domainMap[d];
                        const pct = info.total > 0 ? Math.round((info.done / info.total) * 100) : 0;
                        return `
                        <div>
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span style="font-size:1.1rem;">${getDomainIcon(d)}</span>
                                    <span style="font-weight:600;font-size:0.88rem;">${d}</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <span style="font-size:0.75rem;color:var(--text-muted);">${info.done}/${info.total} tasks</span>
                                    <span style="font-size:0.78rem;font-weight:700;color:var(--primary);">${info.pts} pts</span>
                                    <span style="font-size:0.75rem;font-weight:600;color:${pct === 100 ? 'var(--success)' : 'var(--text-secondary)'};">${pct}%</span>
                                </div>
                            </div>
                            <div class="progress-bar" style="height:8px;">
                                <div class="progress-fill" style="width:${pct}%;background:${getDomainColor(i)};"></div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Recent activity -->
            ${completed.length > 0 ? `
            <div class="card" style="margin-top:24px;">
                <div class="card-header"><span class="card-title">✅ Recently Completed</span></div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${completed.slice(0, 5).map(t => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg);border-radius:var(--radius-sm);">
                            <div>
                                <span style="font-weight:600;font-size:0.85rem;">${t.title}</span>
                                ${t.domain ? `<span class="task-tag tag-domain" style="margin-left:8px;">${t.domain}</span>` : ''}
                            </div>
                            <span class="task-tag tag-points">${t.points || 0} pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        // Render doughnut chart
        const donutCtx = document.getElementById('progressDonut');
        if (donutCtx && typeof Chart !== 'undefined') {
            new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [completed.length, pending.length],
                        backgroundColor: ['#6c5ce7', '#e8e9f0'],
                        borderWidth: 0,
                        cutout: '75%',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a2e',
                            titleFont: { family: 'Inter' },
                            bodyFont: { family: 'Inter' },
                            padding: 12,
                            cornerRadius: 10,
                        }
                    }
                }
            });
        }

        // Render domain bar chart
        const domainCtx = document.getElementById('domainChart');
        if (domainCtx && typeof Chart !== 'undefined' && domainNames.length > 0) {
            new Chart(domainCtx, {
                type: 'bar',
                data: {
                    labels: domainNames,
                    datasets: [
                        {
                            label: 'Earned',
                            data: domainNames.map(d => domainMap[d].pts),
                            backgroundColor: domainNames.map((_, i) => getDomainColor(i) + 'cc'),
                            borderRadius: 6,
                            borderSkipped: false,
                        },
                        {
                            label: 'Tasks Done',
                            data: domainNames.map(d => domainMap[d].done),
                            backgroundColor: domainNames.map((_, i) => getDomainColor(i) + '33'),
                            borderRadius: 6,
                            borderSkipped: false,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12, borderRadius: 3, useBorderRadius: true, padding: 16 }
                        },
                        tooltip: {
                            backgroundColor: '#1a1a2e',
                            titleFont: { family: 'Inter' },
                            bodyFont: { family: 'Inter' },
                            padding: 12,
                            cornerRadius: 10,
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 } }, beginAtZero: true }
                    }
                }
            });
        }
    }

    // ===== VIEW: CREATE TASK (Mentor) =====
    async function loadCreateTask() {
        const [students, domains] = await Promise.all([apiFetch('/students'), apiFetch('/domains')]);

        contentArea.innerHTML = `
            <div class="card" style="max-width:600px;">
                <div class="card-header"><span class="card-title">Create New Task</span></div>
                <form id="createTaskForm">
                    <div class="form-group">
                        <label class="form-label">Task Title *</label>
                        <input type="text" class="form-input" id="taskTitle" required placeholder="e.g. Build a REST API">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" id="taskDesc" placeholder="Describe the task..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Domain *</label>
                        <select class="form-select" id="taskDomain" required>
                            <option value="">Select domain</option>
                            ${domains.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Assign To</label>
                        <select class="form-select" id="taskStudent">
                            <option value="">📢 All students in selected domain</option>
                            ${students.map(s => `<option value="${s.id}" data-domain="${s.domain || ''}">${s.name} (${s.domain || 'No domain'})</option>`).join('')}
                        </select>
                        <p style="font-size:0.72rem;color:var(--text-3,#8e90a6);margin-top:5px;" id="assignHint">
                            Leave as default to assign this task to <strong>every student</strong> in the chosen domain.
                        </p>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div class="form-group">
                            <label class="form-label">Points</label>
                            <input type="number" class="form-input" id="taskPoints" value="10" min="1" max="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Deadline</label>
                            <input type="date" class="form-input" id="taskDeadline">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" id="createTaskBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create Task
                    </button>
                </form>
            </div>
        `;

        // Filter student dropdown when domain changes
        const domainSelect = document.getElementById('taskDomain');
        const studentSelect = document.getElementById('taskStudent');
        const assignHint = document.getElementById('assignHint');
        const allStudentOptions = Array.from(studentSelect.querySelectorAll('option[value]'));

        domainSelect.addEventListener('change', () => {
            const selectedDomain = domainSelect.value;
            // Show/hide students based on domain
            allStudentOptions.forEach(opt => {
                if (!selectedDomain || opt.dataset.domain === selectedDomain) {
                    opt.style.display = '';
                } else {
                    opt.style.display = 'none';
                }
            });
            studentSelect.value = ''; // reset to "all students"
            const count = allStudentOptions.filter(o => o.dataset.domain === selectedDomain).length;
            if (selectedDomain) {
                assignHint.innerHTML = `Will assign to <strong>${count} student${count !== 1 ? 's' : ''}</strong> in <strong>${selectedDomain}</strong>, or pick one below.`;
            } else {
                assignHint.innerHTML = 'Leave as default to assign this task to <strong>every student</strong> in the chosen domain.';
            }
        });

        document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = domainSelect.value;
            if (!domain) { showToast('Please select a domain', 'error'); return; }

            const btn = document.getElementById('createTaskBtn');
            btn.disabled = true;

            const body = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDesc').value,
                domain: domain,
                assigned_to: studentSelect.value || null,
                points: parseInt(document.getElementById('taskPoints').value) || 10,
                deadline: document.getElementById('taskDeadline').value || null,
            };

            const data = await apiPost('/tasks', body);
            showToast(data.message || 'Task created!');
            btn.disabled = false;
            e.target.reset();
            assignHint.innerHTML = 'Leave as default to assign this task to <strong>every student</strong> in the chosen domain.';
        });
    }

    // ===== VIEW: STUDENTS (Mentor) =====
    async function loadStudents() {
        const students = await apiFetch('/students');

        contentArea.innerHTML = `
            <div class="card">
                ${students.length === 0 ? '<p style="color:var(--text-muted);text-align:center;padding:24px;">No students registered yet</p>' : `
                <table class="user-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Domain</th><th>Credits</th></tr></thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td style="font-weight:600;">${s.name}</td>
                                <td>${s.email}</td>
                                <td>${s.domain || '—'}</td>
                                <td style="font-weight:700;color:var(--primary);">${s.credits}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
        `;
    }

    // ===== VIEW: MANAGE USERS (Admin) =====
    async function loadUsers() {
        const users = await apiFetch('/users');

        contentArea.innerHTML = `
            <div class="card">
                <table class="user-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Domain</th><th>Credits</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td style="font-weight:600;">${u.name}</td>
                                <td>${u.email}</td>
                                <td><span class="role-tag role-${u.role}">${u.role}</span></td>
                                <td>${u.domain || '—'}</td>
                                <td>${u.credits}</td>
                                <td>${u.id !== user.id ? `<button class="btn btn-danger btn-sm delete-user-btn" data-id="${u.id}">Delete</button>` : '<span style="font-size:0.75rem;color:var(--text-muted);">You</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        contentArea.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this user?')) return;
                await apiDelete(`/users/${btn.dataset.id}`);
                showToast('User deleted');
                loadUsers();
            });
        });
    }

    // ===== VIEW: MANAGE DOMAINS (Admin) =====
    async function loadManageDomains() {
        const domains = await apiFetch('/domains');

        contentArea.innerHTML = `
            <div class="card" style="max-width:500px;margin-bottom:24px;">
                <div class="card-header"><span class="card-title">Add New Domain</span></div>
                <form id="addDomainForm">
                    <div class="form-group">
                        <label class="form-label">Domain Name *</label>
                        <input type="text" class="form-input" id="domainName" required placeholder="e.g. Data Science">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Roadmap</label>
                        <textarea class="form-textarea" id="domainRoadmap" placeholder="Step-by-step learning path..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Add Domain</button>
                </form>
            </div>

            <div class="section-title">Existing Domains</div>
            <div class="grid-3">
                ${domains.map((d, i) => `
                    <div class="domain-card">
                        <div class="domain-icon" style="background:${getDomainColor(i)}20;"><span>${getDomainIcon(d.name)}</span></div>
                        <div class="domain-name">${d.name}</div>
                        <div class="domain-roadmap">${d.roadmap || '—'}</div>
                        <button class="btn btn-danger btn-sm delete-domain-btn" data-id="${d.id}" style="margin-top:12px;">Delete</button>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('addDomainForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await apiPost('/domains', {
                name: document.getElementById('domainName').value,
                roadmap: document.getElementById('domainRoadmap').value,
            });
            showToast('Domain created!');
            loadManageDomains();
        });

        contentArea.querySelectorAll('.delete-domain-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this domain?')) return;
                await apiDelete(`/domains/${btn.dataset.id}`);
                showToast('Domain deleted');
                loadManageDomains();
            });
        });
    }

    // ===== VIEW: ANNOUNCEMENTS (Admin) =====
    async function loadAnnouncements() {
        const announcements = await apiFetch('/announcements');

        contentArea.innerHTML = `
            <div class="card" style="max-width:600px;margin-bottom:24px;">
                <div class="card-header"><span class="card-title">📢 Post Announcement</span></div>
                <form id="addAnnouncementForm">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-input" id="annTitle" required placeholder="e.g. Hackathon This Weekend!">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message *</label>
                        <textarea class="form-textarea" id="annMessage" required placeholder="Write your announcement..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Announcement</button>
                </form>
            </div>

            <div class="section-title">All Announcements</div>
            ${announcements.length === 0 ? '<div class="card"><p style="color:var(--text-muted);">No announcements yet</p></div>' :
            announcements.map(a => `
                <div class="announcement-card" style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <div class="announcement-title">${a.title}</div>
                        <div class="announcement-msg">${a.message}</div>
                        <div class="announcement-time">By ${a.author || 'Admin'} • ${timeAgo(a.created_at)}</div>
                    </div>
                    <button class="btn btn-danger btn-sm delete-ann-btn" data-id="${a.id}" style="flex-shrink:0;">Delete</button>
                </div>
            `).join('')}
        `;

        document.getElementById('addAnnouncementForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await apiPost('/announcements', {
                title: document.getElementById('annTitle').value,
                message: document.getElementById('annMessage').value,
            });
            showToast('Announcement posted!');
            loadAnnouncements();
        });

        contentArea.querySelectorAll('.delete-ann-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await apiDelete(`/announcements/${btn.dataset.id}`);
                showToast('Announcement deleted');
                loadAnnouncements();
            });
        });
    }

    // ===== Sidebar Toggle =====
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('active');
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
        window.location.href = '/';
    });

    // ===== INIT =====
    buildNav();
    navigateTo('home');
})();
