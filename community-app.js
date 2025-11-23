// Community App Logic

document.addEventListener('DOMContentLoaded', () => {
    initializeCommunityApp();
});

function initializeCommunityApp() {
    // Initialize Communities if not present
    if (!AppState.communities) {
        AppState.communities = [
            { id: 'c1', name: 'CS101', category: 'Computer Science', color: '#6366f1', members: [] },
            { id: 'c2', name: 'Math Club', category: 'Mathematics', color: '#ec4899', members: [] },
            { id: 'c3', name: 'Physics', category: 'Science', color: '#10b981', members: [] },
            { id: 'c4', name: 'General', category: 'General', color: '#f59e0b', members: [] }
        ];
    }

    renderStories();
    renderFeed();
    renderSuggestions();
    setupEventListeners();
}

// --- Rendering ---

function renderStories() {
    const container = document.getElementById('communitiesBar');
    if (!container) return;

    // Keep the "New Group" button
    const createBtn = container.firstElementChild;
    container.innerHTML = '';
    if (createBtn) container.appendChild(createBtn);

    const communities = AppState.communities || [];
    communities.forEach(community => {
        const story = document.createElement('div');
        story.className = 'story-item';
        story.innerHTML = `
            <div class="story-ring">
                <div class="story-avatar" style="background: ${community.color}; color: white; font-size: 1rem;">
                    ${getInitials(community.name)}
                </div>
            </div>
            <span class="story-name">${escapeHtml(community.name)}</span>
        `;
        story.onclick = () => filterFeedByCommunity(community.name);
        container.appendChild(story);
    });
}

function renderFeed(filterCommunity = null) {
    const container = document.getElementById('feed');
    if (!container) return;

    let posts = AppState.posts || [];
    const currentUser = getCurrentUser();

    // Community Header
    if (filterCommunity) {
        const community = (AppState.communities || []).find(c => c.name === filterCommunity);
        if (community) {
            const isMember = currentUser && community.members && community.members.includes(currentUser.id);
            const memberCount = community.members ? community.members.length : 0;

            const header = document.createElement('div');
            header.style.cssText = 'background: white; border: 1px solid var(--border-light); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;';
            header.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: ${community.color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        ${getInitials(community.name)}
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.25rem;">${escapeHtml(community.name)}</h2>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${escapeHtml(community.category)} · ${memberCount} members</div>
                    </div>
                </div>
                <button class="btn ${isMember ? 'btn-secondary' : 'btn-primary'}" onclick="toggleMembership('${community.id}')">
                    ${isMember ? 'Joined' : 'Join'}
                </button>
            `;

            // Clear container and add header first
            container.innerHTML = '';
            container.appendChild(header);
        } else {
            container.innerHTML = ''; // Clear if community not found (shouldn't happen)
        }
    } else {
        container.innerHTML = '';
    }

    if (filterCommunity) {
        posts = posts.filter(p => p.community === filterCommunity);
    }

    // Sort by new
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (posts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
            </div>
        `;
        container.appendChild(emptyState);
        return;
    }

    const postsHTML = posts.map(post => `
        <div class="insta-card">
            <div class="insta-header">
                <div class="insta-user">
                    <div class="insta-avatar" style="background: var(--primary); color: white;">
                        ${getInitials(post.author)}
                    </div>
                    <div>
                        <a href="profile.html?user=${encodeURIComponent(post.author)}" style="line-height: 1.2; color: inherit; text-decoration: none; font-weight: 600; cursor: pointer;">${escapeHtml(post.author)}</a>
                        ${post.community ? `<div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 400;">${escapeHtml(post.community)}</div>` : ''}
                    </div>
                </div>
                <button class="insta-action-btn"><i class="fas fa-ellipsis-h"></i></button>
            </div>
            
            <div class="insta-content" style="padding: 0;">
                ${post.image ? `<img src="${post.image}" style="width: 100%; display: block;" alt="Post image">` : ''}
                ${post.content ? `<div style="padding: 1rem;">${formatMessage(post.content)}</div>` : ''}
            </div>
            
            <div class="insta-actions">
                <button class="insta-action-btn ${post.liked ? 'liked' : ''}" onclick="likePost('${post.id}')">
                    <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="insta-action-btn" onclick="openComments('${post.id}')">
                    <i class="far fa-comment"></i>
                </button>
                <button class="insta-action-btn">
                    <i class="far fa-paper-plane"></i>
                </button>
                <button class="insta-action-btn" style="margin-left: auto;">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>

            <div class="insta-likes">
                ${post.likes} likes
            </div>

            <div class="insta-caption">
                <strong>${escapeHtml(post.author)}</strong> ${escapeHtml(post.title)}
            </div>

            <div class="insta-comments-link" onclick="openComments('${post.id}')">
                View all ${post.comments ? post.comments.length : 0} comments
            </div>

            <div class="insta-time">
                ${formatTimeAgo(post.createdAt)}
            </div>
            
            <div class="insta-add-comment" style="border-top: 1px solid var(--border-light); padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="far fa-smile" style="font-size: 1.25rem; color: var(--text-secondary); cursor: pointer;"></i>
                <input type="text" placeholder="Add a comment..." style="border: none; flex: 1; outline: none; font-size: 0.9rem;" onkeypress="handleCommentKey(event, '${post.id}')">
                <button style="background: none; border: none; color: var(--primary); font-weight: 600; font-size: 0.9rem; cursor: pointer; opacity: 0.5;" onclick="postComment('${post.id}', this.previousElementSibling.value)">Post</button>
            </div>
        </div>
    `).join('');

    // Append posts to container (which might already have the header)
    const postsContainer = document.createElement('div');
    postsContainer.innerHTML = postsHTML;
    container.appendChild(postsContainer);
}

function toggleMembership(communityId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Please login to join communities', 'error');
        return;
    }

    const communities = AppState.communities || [];
    const community = communities.find(c => c.id === communityId);

    if (community) {
        if (!community.members) community.members = [];

        const index = community.members.indexOf(currentUser.id);
        if (index === -1) {
            community.members.push(currentUser.id);
            showToast(`Joined ${community.name}`, 'success');
        } else {
            community.members.splice(index, 1);
            showToast(`Left ${community.name}`, 'success');
        }

        AppState.communities = communities;
        renderFeed(community.name); // Re-render to update button
    }
}

function renderSuggestions() {
    const container = document.getElementById('suggestionsList');
    if (!container) return;

    // Mock suggestions
    const suggestions = [
        { name: 'math_wizard', info: 'New to Instagram' },
        { name: 'physics_lab', info: 'Followed by student_user' },
        { name: 'campus_events', info: 'Suggested for you' }
    ];

    container.innerHTML = suggestions.map(s => `
        <div class="suggestion-item">
            <div class="suggestion-user">
                <div class="insta-avatar" style="width: 32px; height: 32px;">${s.name[0].toUpperCase()}</div>
                <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">${s.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem;">${s.info}</div>
                </div>
            </div>
            <button class="follow-btn">Follow</button>
        </div>
    `).join('');
}

// --- Comments System ---

function openComments(postId) {
    const posts = AppState.posts || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Create or get comments modal
    let modal = document.getElementById('commentsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'commentsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; height: 80vh; display: flex; flex-direction: column; padding: 0;">
                <div class="modal-header" style="border-bottom: 1px solid var(--border-light); padding: 1rem;">
                    <h3 style="margin: 0; font-size: 1.1rem; text-align: center; flex: 1;">Comments</h3>
                    <button class="modal-close" onclick="closeModal('commentsModal')"><i class="fas fa-times"></i></button>
                </div>
                <div id="commentsList" style="flex: 1; overflow-y: auto; padding: 1rem;"></div>
                <div style="border-top: 1px solid var(--border-light); padding: 1rem; display: flex; gap: 0.5rem;">
                    <input type="text" id="modalCommentInput" class="form-input" placeholder="Add a comment..." style="border-radius: 20px;">
                    <button class="btn btn-primary btn-sm" id="modalPostBtn">Post</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal('commentsModal');
        });
    }

    const commentsList = modal.querySelector('#commentsList');
    const renderComments = () => {
        const currentPost = (AppState.posts || []).find(p => p.id === postId);
        const comments = currentPost ? (currentPost.comments || []) : [];

        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">No comments yet.</div>';
        } else {
            commentsList.innerHTML = comments.map(c => `
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
                    <div class="insta-avatar" style="width: 32px; height: 32px; min-width: 32px;">${getInitials(c.author)}</div>
                    <div>
                        <div style="font-size: 0.9rem;">
                            <span style="font-weight: 600; margin-right: 0.5rem;">${escapeHtml(c.author)}</span>
                            ${escapeHtml(c.text)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${formatTimeAgo(c.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        }
    };

    renderComments();

    const postBtn = modal.querySelector('#modalPostBtn');
    const input = modal.querySelector('#modalCommentInput');

    // Clone to remove old listeners
    const newBtn = postBtn.cloneNode(true);
    postBtn.parentNode.replaceChild(newBtn, postBtn);

    newBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            addComment(postId, text);
            input.value = '';
            renderComments();
        }
    });

    openModal('commentsModal');
}

function handleCommentKey(event, postId) {
    if (event.key === 'Enter') {
        postComment(postId, event.target.value);
        event.target.value = '';
    }
}

function postComment(postId, text) {
    if (!text.trim()) return;
    addComment(postId, text);
    renderFeed();
}

function addComment(postId, text) {
    const user = getCurrentUser();
    const posts = AppState.posts || [];
    const post = posts.find(p => p.id === postId);

    if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push({
            id: generateId(),
            text: text,
            author: user ? user.name : 'Anonymous',
            createdAt: new Date().toISOString()
        });
        AppState.posts = posts;
        showToast('Comment added', 'success');
    }
}

// --- Helpers ---

function getInitials(name) {
    return name ? name.substring(0, 2).toUpperCase() : '??';
}

function getRandomColor() {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    return colors[Math.floor(Math.random() * colors.length)];
}
