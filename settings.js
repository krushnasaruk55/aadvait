document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadApiKeys();
});

function loadProfile() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('settingsName').value = user.name;
        document.getElementById('settingsEmail').value = user.email;
        document.getElementById('profileNameDisplay').textContent = user.name;
        document.getElementById('profileEmailDisplay').textContent = user.email;
        document.getElementById('profileAvatar').textContent = user.name.substring(0, 1).toUpperCase();
    }
}

function saveProfile() {
    const name = document.getElementById('settingsName').value.trim();
    if (!name) {
        showToast('Name cannot be empty', 'error');
        return;
    }

    const user = getCurrentUser();
    if (user) {
        user.name = name;
        localStorage.setItem('studyhub_current_user', JSON.stringify(user));

        // Update stored users list as well
        const users = JSON.parse(localStorage.getItem('studyhub_users') || '[]');
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users[index].name = name;
            localStorage.setItem('studyhub_users', JSON.stringify(users));
        }

        loadProfile(); // Refresh display
        showToast('Profile updated successfully', 'success');
    }
}

function loadApiKeys() {
    const keys = AppState.apiKeys;
    document.getElementById('deepseekKey').value = keys.deepseek || '';
    document.getElementById('youtubeKey').value = keys.youtube || '';
}

function saveApiKeys() {
    const deepseek = document.getElementById('deepseekKey').value.trim();
    const youtube = document.getElementById('youtubeKey').value.trim();

    AppState.apiKeys = {
        deepseek: deepseek,
        youtube: youtube
    };

    showToast('API keys saved successfully', 'success');
}

function toggleVisibility(id) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
