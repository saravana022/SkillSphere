/**
 * SkillSphere — Login/Register with AI Domain Recommendation Modal
 */
(function () {
    'use strict';

    // Already logged in?
    if (localStorage.getItem('ss_token')) { window.location.href = '/dashboard'; return; }

    // DOM
    const authForm = document.getElementById('authForm');
    const loginModeBtn = document.getElementById('loginModeBtn');
    const registerModeBtn = document.getElementById('registerModeBtn');
    const modeIndicator = document.getElementById('modeIndicator');
    const switchLink = document.getElementById('switchLink');
    const nameField = document.getElementById('nameField');
    const roleField = document.getElementById('roleField');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const footerText = document.getElementById('footerText');
    const btnText = document.getElementById('btnText');
    const errorMsg = document.getElementById('errorMsg');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');
    const rolePills = document.querySelectorAll('.role-pill');
    const rolePillsContainer = document.getElementById('rolePills');

    let isRegister = false;
    let selectedRole = null;
    let registrationData = null; // Store temp sign up data before domain picking

    // ===== Mode Toggle =====
    function setMode(register) {
        isRegister = register;
        errorMsg.textContent = '';
        errorMsg.className = 'error-msg';

        if (register) {
            modeIndicator.classList.add('right');
            registerModeBtn.classList.add('active');
            loginModeBtn.classList.remove('active');
            nameField.style.display = 'block';
            formTitle.textContent = 'Create account';
            formSubtitle.textContent = 'Start your learning journey today';
            btnText.textContent = 'Create Account';
            footerText.innerHTML = 'Already have an account? <a href="#" id="switchLink">Sign in</a>';
        } else {
            modeIndicator.classList.remove('right');
            loginModeBtn.classList.add('active');
            registerModeBtn.classList.remove('active');
            nameField.style.display = 'none';
            formTitle.textContent = 'Welcome back';
            formSubtitle.textContent = 'Sign in to continue your journey';
            btnText.textContent = 'Sign In';
            footerText.innerHTML = 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
        }

        document.getElementById('switchLink').addEventListener('click', (e) => { e.preventDefault(); setMode(!isRegister); });
    }

    loginModeBtn.addEventListener('click', () => setMode(false));
    registerModeBtn.addEventListener('click', () => setMode(true));
    switchLink.addEventListener('click', (e) => { e.preventDefault(); setMode(true); });

    // ===== Role Selection =====
    rolePills.forEach(pill => {
        pill.addEventListener('click', () => {
            rolePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedRole = pill.dataset.role;
        });
    });

    // ===== Password Toggle =====
    togglePasswordBtn.addEventListener('click', () => {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        togglePasswordBtn.querySelector('.eye-open').style.display = isPass ? 'none' : 'block';
        togglePasswordBtn.querySelector('.eye-closed').style.display = isPass ? 'block' : 'none';
    });

    // ===== Form Submit =====
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';
        errorMsg.className = 'error-msg';

        if (!selectedRole) {
            rolePillsContainer.classList.remove('shake');
            rolePillsContainer.offsetHeight;
            rolePillsContainer.classList.add('shake');
            setTimeout(() => rolePillsContainer.classList.remove('shake'), 500);
            errorMsg.textContent = 'Please select your role';
            return;
        }

        const email = document.getElementById('emailInput').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            errorMsg.textContent = 'Please fill in all fields';
            return;
        }

        if (isRegister) {
            const name = document.getElementById('nameInput').value.trim();
            if (!name) { errorMsg.textContent = 'Please enter your name'; return; }

            // Store data and begin AI workflow if student
            registrationData = { name, email, password, role: selectedRole };
            
            if (selectedRole === 'student') {
                startAIChat();
            } else {
                completeRegistration(); // Mentors/Admins don't need domain recommended
            }
        } else {
            const submitBtn = document.getElementById('submitBtn');
            const origText = btnText.textContent;
            submitBtn.disabled = true;
            btnText.textContent = 'Signing in...';

            try {
                await doLogin(email, password);
            } catch (err) {
                errorMsg.className = 'error-msg';
                errorMsg.textContent = err.message;
                submitBtn.disabled = false;
                btnText.textContent = origText;
            }
        }
    });

    async function completeRegistration(domain = null) {
        if (!registrationData) return;
        
        const submitBtn = document.getElementById('submitBtn');
        const origText = btnText.textContent;
        submitBtn.disabled = true;
        btnText.textContent = 'Creating...';
        
        try {
            const reqBody = { ...registrationData };
            if (domain) reqBody.domain = domain;

            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Hide AI overlay if it was open
            aiOverlay.classList.remove('active');

            errorMsg.className = 'error-msg success';
            errorMsg.textContent = '✓ Account created! Signing in...';
            setTimeout(() => doLogin(registrationData.email, registrationData.password), 800);
        } catch (err) {
            aiOverlay.classList.remove('active');
            errorMsg.className = 'error-msg';
            errorMsg.textContent = err.message;
            submitBtn.disabled = false;
            btnText.textContent = origText;
        }
    }

    async function doLogin(email, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem('ss_token', data.token);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
    }


    /* ================================================================
       AI CHATBOT LOGIC
       ================================================================ */

    const aiOverlay = document.getElementById('aiOverlay');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    const aiChat = document.getElementById('aiChat');
    const aiInputArea = document.getElementById('aiInputArea');
    const aiStatus = document.querySelector('.ai-status');

    let currentQuestionIndex = 0;
    let userAnswers = [];

    // The questions flow
    const aiQuestions = [
        {
            text: `Hi ${getNameFirstName()}! I'm your AI guide. Let's find the best domain for you. First, what interests you the most?`,
            type: 'options',
            options: [
                { emoji: '🎨', text: 'Building Websites & UI', value: 'building websites visual frontend ui design' },
                { emoji: '🤖', text: 'Data & AI', value: 'data machine learning AI solving puzzles prediction' },
                { emoji: '🔐', text: 'Hacking & Security', value: 'security hacking protecting systems' },
                { emoji: '📱', text: 'Mobile Apps', value: 'mobile apps android ios' },
                { emoji: '☁️', text: 'Servers & Cloud', value: 'servers cloud scalable infrastructure' }
            ]
        },
        {
            text: "Cool! What's your current experience level with coding?",
            type: 'options',
            options: [
                { emoji: '🌱', text: 'Beginner', value: 'beginner' },
                { emoji: '🚀', text: 'Intermediate', value: 'intermediate' },
                { emoji: '🔥', text: 'Advanced', value: 'advanced' }
            ]
        },
        {
            text: "And what kind of work style do you enjoy more?",
            type: 'options',
            options: [
                { emoji: '✨', text: 'Creative & Visually pleasing', value: 'creative visual artistic' },
                { emoji: '🧩', text: 'Logical & Problem solving', value: 'logical analytical problem-solving math detective' },
                { emoji: '🛠️', text: 'Building Infrastructure', value: 'infrastructure systems planning automation' }
            ]
        },
        {
            text: "Last question! Pick one project that excites you the most:",
            type: 'options',
            options: [
                { emoji: '🛒', text: 'An interactive E-commerce Website', value: 'interactive website landing page web app' },
                { emoji: '📈', text: 'An AI that predicts stock prices', value: 'predict model chatbot neural' },
                { emoji: '🛡️', text: 'Finding vulnerabilities in a bank network', value: 'hack penetration vulnerability ctf' },
                { emoji: '🎮', text: 'A viral Mobile Game or Utility App', value: 'mobile android ios app' },
                { emoji: '⚙️', text: 'Automating deployment for 1000 servers', value: 'automate ci/cd pipeline docker scale' }
            ]
        }
    ];

    function getNameFirstName() {
        if (!registrationData || !registrationData.name) return 'there';
        return registrationData.name.split(' ')[0];
    }

    function startAIChat() {
        aiOverlay.classList.add('active');
        aiChat.innerHTML = '';
        aiInputArea.innerHTML = '';
        currentQuestionIndex = 0;
        userAnswers = [];
        aiStatus.textContent = 'Finding your perfect domain...';
        
        // Render progress bar
        renderProgress();
        askQuestion(0);
    }

    function renderProgress() {
        let dotsHTML = '';
        for (let i = 0; i < aiQuestions.length; i++) {
            let stateClass = '';
            if (i < currentQuestionIndex) stateClass = 'done';
            else if (i === currentQuestionIndex) stateClass = 'current';
            dotsHTML += `<div class="ai-progress-dot ${stateClass}"></div>`;
        }
        
        let progressDiv = document.getElementById('aiProgress');
        if (!progressDiv) {
            progressDiv = document.createElement('div');
            progressDiv.id = 'aiProgress';
            progressDiv.className = 'ai-progress';
            aiInputArea.parentElement.insertBefore(progressDiv, aiInputArea); // Insert above input area
        }
        progressDiv.innerHTML = dotsHTML;
    }

    aiCloseBtn.addEventListener('click', () => {
        if (confirm('Skip domain recommendation and just register?')) {
            completeRegistration(null);
        }
    });

    async function askQuestion(index) {
        if (index >= aiQuestions.length) {
            await fetchRecommendations();
            return;
        }

        renderProgress();
        const q = aiQuestions[index];
        if (index === 0) {
            q.text = `Hi ${getNameFirstName()}! I'm your AI guide. Let's find the best domain for you. First, what interests you the most?`;
        }
        
        await showTyping();
        addMessage(q.text, 'bot');
        renderInputOptions(q);
    }

    async function showTyping() {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.className = 'ai-typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            aiChat.appendChild(typing);
            scrollToBottom();

            setTimeout(() => {
                typing.remove();
                resolve();
            }, 800 + Math.random() * 800); // 0.8s - 1.6s typing delay
        });
    }

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `ai-msg ${sender}`;
        msg.innerHTML = text;
        aiChat.appendChild(msg);
        scrollToBottom();
    }

    function scrollToBottom() {
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    function renderInputOptions(question) {
        aiInputArea.innerHTML = '';
        
        if (question.type === 'options') {
            const optsContainer = document.createElement('div');
            optsContainer.className = 'ai-options';
            
            question.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'ai-option-btn';
                btn.innerHTML = `<span class="option-emoji">${opt.emoji}</span> ${opt.text}`;
                btn.onclick = () => {
                    handleAnswer(opt.text, opt.value);
                };
                optsContainer.appendChild(btn);
            });
            
            aiInputArea.appendChild(optsContainer);
            
            // Add skip option below
            const skipBtn = document.createElement('button');
            skipBtn.className = 'ai-skip-btn';
            skipBtn.textContent = 'Skip this question';
            skipBtn.onclick = () => handleAnswer('', '');
            aiInputArea.appendChild(skipBtn);
        }
    }

    function handleAnswer(displayHtml, valueToStore) {
        aiInputArea.innerHTML = ''; // clear input
        if (displayHtml) {
            addMessage(displayHtml, 'user');
        }
        
        userAnswers.push(valueToStore);
        currentQuestionIndex++;
        
        setTimeout(() => askQuestion(currentQuestionIndex), 400);
    }

    async function fetchRecommendations() {
        const progressDiv = document.getElementById('aiProgress');
        if (progressDiv) progressDiv.remove();
        
        aiInputArea.innerHTML = '';
        aiStatus.textContent = 'Analyzing your responses...';
        await showTyping();
        addMessage('Analyzing your profile based on your answers...', 'bot');

        try {
            const res = await fetch('/api/ai/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: userAnswers })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error);

            aiStatus.textContent = 'Recommendations ready!';
            await showTyping();
            addMessage('Here are the best domains for you! Click one to select it and finish signing up.', 'bot');
            
            renderRecommendations(data.recommendations);
            
        } catch (err) {
            addMessage('Oops! Could not fetch recommendations. You can skip for now.', 'bot');
            const skipBtn = document.createElement('button');
            skipBtn.className = 'submit-btn';
            skipBtn.textContent = 'Skip & Finish Registration';
            skipBtn.onclick = () => completeRegistration(null);
            aiInputArea.appendChild(skipBtn);
        }
    }

    function renderRecommendations(recs) {
        aiInputArea.innerHTML = ''; // Clear options
        
        const grid = document.createElement('div');
        grid.className = 'ai-rec-grid';
        
        const colors = ['#6c5ce7', '#00b894', '#0984e3'];
        const domainIcons = {
            'web development': '🌐', 'artificial intelligence': '🤖', 'cloud computing': '☁️',
            'devops': '⚙️', 'cybersecurity': '🔒', 'mobile development': '📱'
        };

        recs.forEach((rec, i) => {
            const isTop = i === 0;
            const iconStr = domainIcons[(rec.name || '').toLowerCase()] || '💡';
            
            const card = document.createElement('div');
            card.className = `ai-rec-card ${isTop ? 'top-pick' : ''}`;
            card.innerHTML = `
                <div class="ai-rec-icon" style="background:${colors[i%colors.length]}15; color:${colors[i%colors.length]}">${iconStr}</div>
                <div class="ai-rec-info">
                    <div class="ai-rec-name">${rec.name}</div>
                    <div class="ai-rec-reason">${rec.reason}</div>
                </div>
                <div class="ai-rec-match">
                    <div class="ai-rec-percent">${rec.matchPercent}%</div>
                    <div class="ai-rec-label">Match</div>
                </div>
            `;
            
            card.onclick = () => {
                aiStatus.textContent = 'Finishing registration...';
                aiInputArea.innerHTML = '';
                addMessage(`I selected <strong>${rec.name}</strong>. Great choice!`, 'user');
                setTimeout(() => completeRegistration(rec.name), 800);
            };
            
            grid.appendChild(card);
        });
        
        aiChat.appendChild(grid);
        scrollToBottom();
        
        // Skip final registration option
        const skipBtn = document.createElement('button');
        skipBtn.className = 'ai-skip-btn';
        skipBtn.textContent = 'I will decide my domain later';
        skipBtn.onclick = () => completeRegistration(null);
        aiInputArea.appendChild(skipBtn);
    }

})();