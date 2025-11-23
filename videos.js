// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchBtn').addEventListener('click', searchVideos);
    document.getElementById('topicInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchVideos();
    });
    document.getElementById('configYouTubeBtn').addEventListener('click', () => openAPIConfig('youtube'));
});

// Search Videos
async function searchVideos() {
    const topic = document.getElementById('topicInput').value.trim();

    if (!topic) {
        showToast('Please enter a topic', 'error');
        return;
    }

    const btn = document.getElementById('searchBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';

    try {
        const videos = await searchYouTubeVideos(topic);
        if (videos.length > 0) {
            renderVideos(videos);
        }
    } catch (error) {
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search"></i> Find Videos';
    }
}

// Render Videos
function renderVideos(videos) {
    const grid = document.getElementById('videosGrid');

    grid.innerHTML = videos.map(video => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const description = video.snippet.description;

        return `
            <div class="video-card" onclick="openVideo('${videoId}')">
                <img src="${thumbnail}" alt="${escapeHtml(title)}" class="video-thumbnail" loading="lazy">
                <div class="video-info">
                    <h3 class="video-title">${escapeHtml(title)}</h3>
                    <p class="video-channel">
                        <i class="fas fa-user-circle"></i> ${escapeHtml(channel)}
                    </p>
                    <div class="video-stats">
                        <span><i class="fas fa-play-circle"></i> Watch on YouTube</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open Video
function openVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}
