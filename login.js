// Simple Auth Logic
const authForm = document.getElementById('authForm');
const switchBtn = document.getElementById('switchBtn');
const nameGroup = document.getElementById('nameGroup');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const submitBtn = document.getElementById('submitBtn');
const switchText = document.getElementById('switchText');

let isLogin = true;

switchBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    updateUI();
});

function updateUI() {
    if (isLogin) {
        pageTitle.textContent = 'Welcome Back';
        pageSubtitle.textContent = 'Please enter your details to sign in';
        submitBtn.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchBtn.textContent = 'Sign up';
        nameGroup.style.display = 'none';
        document.getElementById('name').required = false;
    } else {
        pageTitle.textContent = 'Create Account';
        pageSubtitle.textContent = 'Start your learning journey today';
        submitBtn.textContent = 'Sign Up';
        switchText.textContent = 'Already have an account?';
        switchBtn.textContent = 'Sign in';
        nameGroup.style.display = 'block';
        document.getElementById('name').required = true;
    }
}

authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    if (isLogin) {
        // Simulate Login
        const users = JSON.parse(localStorage.getItem('studyhub_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            loginUser(user);
        } else {
            showToast('Invalid email or password', 'error');
        }
    } else {
        // Simulate Signup
        const users = JSON.parse(localStorage.getItem('studyhub_users') || '[]');

        if (users.find(u => u.email === email)) {
            showToast('Email already exists', 'error');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // In a real app, never store plain text passwords!
            avatar: null,
            joinedAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('studyhub_users', JSON.stringify(users));

        loginUser(newUser);
    }
});

function loginUser(user) {
    // Save current user session
    localStorage.setItem('studyhub_current_user', JSON.stringify(user));
    showToast('Success! Redirecting...', 'success');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}
