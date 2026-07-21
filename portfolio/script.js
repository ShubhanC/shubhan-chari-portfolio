/**
 * Portfolio website - JSON-driven project grid
 * Fetch projects from portfolio.json and render them dynamically.
 */

async function loadPortfolio() {
    try {
        const res = await fetch('portfolio.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderProfile(data.profile);
        renderProjects(data.projects);
        setupFilters(data.projects);
        document.getElementById('footer-year').textContent =
            `© ${new Date().getFullYear()}`;
    } catch (err) {
        console.error('Failed to load portfolio:', err);
        document.getElementById('portfolio-grid').innerHTML = `
            <div class="empty-state">
                <p>Failed to load portfolio data. Make sure <code>portfolio.json</code> is accessible.</p>
            </div>
        `;
    }
}

function renderProfile(profile) {
    if (!profile) return;

    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-tagline').textContent = profile.title || profile.tagline;
    document.getElementById('profile-bio').textContent = profile.bio || '';

    const footerName = document.getElementById('footer-name');
    if (footerName) footerName.textContent = profile.name;

    // Avatar
    const avatar = document.getElementById('avatar-placeholder');
    if (avatar && profile.name) {
        const initials = profile.name
            .split(' ')
            .map(w => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
        avatar.textContent = initials;
    }

    // Social links
    const github = document.getElementById('link-github');
    const linkedin = document.getElementById('link-linkedin');
    const email = document.getElementById('link-email');

    if (profile.github && github) {
        github.href = profile.github;
    }
    if (profile.linkedin && linkedin) {
        linkedin.href = profile.linkedin;
    } else if (linkedin) {
        linkedin.style.display = 'none';
    }
    if (profile.email && email) {
        email.href = `mailto:${profile.email}`;
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('portfolio-grid');
    if (!projects || projects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>No projects yet. Check back soon!</p>
            </div>
        `;
        return;
    }

    // Group by category
    const grouped = {};
    for (const proj of projects) {
        const cat = proj.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(proj);
    }

    // Sort categories
    const sortedCats = Object.keys(grouped).sort();

    let html = '';
    for (const cat of sortedCats) {
        const items = grouped[cat];
        html += `
            <div class="category-section" data-category="${escapeHtml(cat)}">
                <h2 class="category-title">
                    ${escapeHtml(cat)}
                    <span class="category-count">${items.length}</span>
                </h2>
                <div class="project-cards">
                    ${items.map(proj => renderCard(proj)).join('')}
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;

    // Wire up iframe buttons after cards are in the DOM
    document.querySelectorAll('.card-btn.iframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const overlay = document.getElementById('app-overlay');
            const iframe = document.getElementById('app-iframe');
            const titleBar = document.getElementById('app-title-bar');
            if (!overlay || !iframe) return;
            titleBar.textContent = btn.dataset.appTitle || 'App';
            iframe.src = btn.dataset.appUrl || '';
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
}

// Close iframe overlay
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-app');
    const overlay = document.getElementById('app-overlay');
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            const iframe = document.getElementById('app-iframe');
            if (iframe) iframe.src = '';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });
        // Close on overlay background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const iframe = document.getElementById('app-iframe');
                if (iframe) iframe.src = '';
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});

function renderCard(proj) {
    const statusClass = (proj.status || 'planned').toLowerCase().replace(' ', '-');
    const hasUrl = proj.url && proj.type === 'external';
    const isLocal = proj.type === 'internal' && proj.url;
    const isIframe = proj.type === 'iframe' && proj.url;

    let actions = '';
    if (isIframe) {
        actions += `
            <button class="card-btn primary iframe-btn"
                data-app-url="${escapeHtml(proj.url)}?embed=true"
                data-app-title="${escapeHtml(proj.title)}">
                🚀 Launch
            </button>
        `;
    } else if (hasUrl || isLocal) {
        actions += `
            <a href="${escapeHtml(proj.url)}" class="card-btn primary" target="_self" rel="noopener">
                ${proj.type === 'internal' ? '🚀 Launch' : '🔗 Visit'}
            </a>
        `;
    }
    if (proj.github) {
        actions += `
            <a href="${escapeHtml(proj.github)}" class="card-btn secondary" target="_blank" rel="noopener">
                📂 Repo
            </a>
        `;
    }
    if (!proj.url && !proj.github) {
        actions += `<span class="card-btn secondary disabled">🔜 Coming Soon</span>`;
    }

    const tags = (proj.tags || []).map(t =>
        `<span class="tag">${escapeHtml(t)}</span>`
    ).join('');

    return `
        <div class="project-card" data-status="${statusClass}">
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(proj.title)}</h3>
                <span class="status-badge ${statusClass}">${statusClass}</span>
            </div>
            <p class="card-description">${escapeHtml(proj.description || '')}</p>
            <div class="card-tags">${tags}</div>
            <div class="card-actions">${actions}</div>
        </div>
    `;
}

function setupFilters(projects) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filterProjects(filter);
        });
    });
}

function filterProjects(filter) {
    const cards = document.querySelectorAll('.project-card');
    const sections = document.querySelectorAll('.category-section');

    if (!cards.length) return;

    if (filter === 'all') {
        cards.forEach(c => c.classList.remove('hidden'));
        sections.forEach(s => s.style.display = '');
        return;
    }

    // "planned" is hidden entirely — never shown in any view
    if (filter === 'planned') return;

    cards.forEach(c => {
        if (c.dataset.status === filter) {
            c.classList.remove('hidden');
        } else {
            c.classList.add('hidden');
        }
    });

    // Hide empty categories
    sections.forEach(s => {
        const visibleCards = s.querySelectorAll('.project-card:not(.hidden)');
        if (visibleCards.length === 0) {
            s.style.display = 'none';
        } else {
            s.style.display = '';
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPortfolio);
} else {
    loadPortfolio();
}
