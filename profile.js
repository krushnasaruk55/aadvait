document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    const currentUser = getCurrentUser();

    if (!username && currentUser) {
        // Default to current user if no param
        loadProfile(currentUser.name);
    } else if (username) {
        loadProfile(username);
    } else {
        window.location.href = 'login.html';
    }
});

function loadProfile(username) {
    const currentUser = getCurrentUser();
    const isMe = currentUser && currentUser.name === username;

    // Update UI
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileRealName').textContent = username; // In a real app, we'd look up the real name
    document.getElementById('profileAvatar').textContent = username.substring(0, 1).toUpperCase();

    if (isMe) {
        document.getElementById('editProfileBtn').style.display = 'block';
        document.getElementById('editProfileBtn').onclick = () => window.location.href = 'settings.html';
    } else {
        document.getElementById('followBtn').style.display = 'block';
    }

    // Load Posts
    const allPosts = AppState.posts || [];
    const userPosts = allPosts.filter(p => p.author === username);

    // Sort by new
    userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    document.getElementById('postCount').textContent = userPosts.length;

    const grid = document.getElementById('profileGrid');
    if (userPosts.length === 0) {
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        grid.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No Posts Yet</h3>
            </div>
        `;
    } else {
        grid.innerHTML = userPosts.map(post => `
            <div class="grid-item">
                <div class="grid-item-content">
                    ${escapeHtml(post.content)}
                </div>
                <div class="grid-overlay">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0}</span>
                </div>
            </div>
        `).join('');
    }
}
