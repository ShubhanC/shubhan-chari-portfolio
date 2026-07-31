/* Portfolio JavaScript - Fixed navigation with lazy DOM access */

// Domain color mapping
const DOMAIN_COLORS = {
  'ML/AI': '#8b5cf6',
  'Data Science/Stats': '#3b82f6',
  'Software Engineering': '#10b981',
  'Viz/Analysis': '#f97316'
};

// State definitions
const STATES = {
  LOCK: 'lock',
  HOME: 'home',
  FOLDER: 'folder',
  PROJECT_DETAIL: 'project_detail',
  VIDEO: 'video',
  CONTACTS: 'contacts',
  NOTES: 'notes'
};

// Global state
let currentState = null;
let previousState = null;
let isAnimating = false;
let folderContext = null;
let currentProject = null;
let videoContext = null;

/**
 * Set the phone scale factor (0.1 - 3.0 typical range)
 * Updates the CSS variable --phone-scale which controls all sizing
 * @param {number} factor - Scale factor (1.0 = 100%, 0.8 = 80%, etc.)
 */
function setPhoneScale(factor) {
  // Clamp the value to reasonable bounds
  const clampedFactor = Math.max(0.1, Math.min(3.0, factor));
  document.documentElement.style.setProperty('--phone-scale', clampedFactor);

  // Optional: dispatch an event for other components to react to
  window.dispatchEvent(new CustomEvent('phonescalechange', {
    detail: { factor: clampedFactor }
  }));
}

// Lazy DOM access - gets elements when needed, not at load time
function getScreenContent() {
  return document.getElementById('screen-content');
}

function getPhoneScreen() {
  return document.getElementById('phone-screen');
}

// Load data and initialize
async function init() {
  try {
    const response = await fetch('data/projects.json');
    const data = await response.json();
    window.APP_DATA = data;
    renderLockScreen();
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    renderLockScreen();
  }
}

// Render lock screen
function renderLockScreen() {
  const screenContent = getScreenContent();
  if (!screenContent) {
    console.error('screen-content not found');
    return;
  }

  console.log('Rendering lock screen');

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  }).padStart(4, '0');

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  screenContent.innerHTML = `
    <div class="view lock-screen" id="lock-screen">
      <div class="wallpaper"></div>
      <div class="lock-content">
        <div class="lock-time">${time}</div>
        <div class="lock-date">${date}</div>
        <h1 class="lock-name">Shubhan Chari</h1>
        <p class="lock-tagline">Statistics & Computer Science at UIUC</p>
      </div>
      <div class="unlock-hint">Tap to unlock</div>
    </div>
  `;

  currentState = STATES.LOCK;

  // Add click handler to the lock screen div
  const lockScreen = document.getElementById('lock-screen');
  if (lockScreen) {
    console.log('Lock screen click handler attached');
    lockScreen.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Lock screen clicked, navigating to HOME');
      navigateTo(STATES.HOME);
    });
  }
}

// Simple transition helper
function fadeTransition(element, fromOpacity, toOpacity, duration) {
  return new Promise(resolve => {
    if (element) {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = fromOpacity;
      setTimeout(() => {
        element.style.opacity = toOpacity;
        setTimeout(resolve, duration);
      }, 10);
    } else {
      setTimeout(resolve, duration);
    }
  });
}

// Set phone scale - allows dynamic resizing of the entire phone UI
function setPhoneScale(factor) {
  // Clamp factor to reasonable range
  const clampedFactor = Math.max(0.3, Math.min(2.0, factor));
  document.documentElement.style.setProperty('--phone-scale', clampedFactor);
  // Dispatch custom event for any listeners
  window.dispatchEvent(new CustomEvent('phonescalechange', { detail: { scale: clampedFactor } }));
}

// Navigate to state
async function navigateTo(state, data = {}) {
  console.log('Navigating to state:', state);
  if (isAnimating) return;
  isAnimating = true;

  const screenContent = getScreenContent();
  const phoneScreen = getPhoneScreen();

  // Fade out
  await fadeTransition(screenContent, 1, 0, 150);

  // Clear content
  if (screenContent) {
    screenContent.innerHTML = '';
  }

  // Render target state
  switch (state) {
    case STATES.HOME:
      renderHomeScreen();
      break;
    case STATES.FOLDER:
      renderFolder();
      break;
    case STATES.PROJECT_DETAIL:
      renderProjectDetail(data);
      break;
    case STATES.VIDEO:
      openVideo(data.appId);
      break;
    case STATES.CONTACTS:
      renderContacts();
      break;
    case STATES.NOTES:
      renderNotes();
      break;
  }

  // Fade in
  await fadeTransition(screenContent, 0, 1, 200);

  currentState = state;
  isAnimating = false;
}

// Render home screen
function renderHomeScreen() {
  const screenContent = getScreenContent();
  if (!screenContent || !window.APP_DATA) return;

  console.log('Rendering home screen');

  const projects = window.APP_DATA.projects;
  const folders = ['personal', 'open-source', 'research', 'coursework'];
  const folderNames = {
    'personal': 'Personal',
    'open-source': 'Open Source',
    'research': 'Research',
    'coursework': 'Coursework'
  };

  // Group projects by folder
  const folderProjects = {};
  folders.forEach(folder => {
    folderProjects[folder] = projects.filter(p => p.folder === folder);
  });

  // Get all folders that have projects
  const activeFolders = folders.filter(f => folderProjects[f].length > 0);

  // Utility apps with file extensions
  const utilityApps = [
    { name: 'Maps', appId: 'google_maps', ext: 'webp' },
    { name: 'Photos', appId: 'photos', ext: 'webp' },
    { name: 'Pinterest', appId: 'pinterest', ext: 'svg' },
    { name: 'GitHub', appId: 'github', ext: 'svg' },
    { name: 'Canva', appId: 'canva', ext: 'png' }
  ];

  let html = '<div class="view home-screen">';
  html += '<div class="home-grid">';

  // Render folder icons
  activeFolders.forEach(folder => {
    const miniIcons = folderProjects[folder]
      .slice(0, 4)
      .map(() => '<div class="mini-icon"></div>')
      .join('');

    html += `
      <div class="app-icon-wrapper" data-folder="${folder}">
        <div class="app-icon folder-icon">
          <div class="mini-icons">${miniIcons}</div>
        </div>
        <span class="app-label">${folderNames[folder]}</span>
      </div>
    `;
  });

  // Render utility apps
  utilityApps.forEach(app => {
    html += `
      <div class="app-icon-wrapper" data-app="${app.appId}">
        <div class="app-icon" style="background-image: url('assets/icons/${app.appId}.${app.ext}'); background-size: contain; background-position: center; background-repeat: no-repeat;">
        </div>
        <span class="app-label">${app.name}</span>
      </div>
    `;
  });

  html += '</div>';
  html += '<div class="dock">';
  html += '<div class="dock-item" data-action="contacts"><img src="assets/icons/contacts.webp" class="dock-icon" alt="Contacts"/></div>';
  html += '<div class="dock-item" data-action="notes"><img src="assets/icons/notes.svg" class="dock-icon" alt="Notes"/></div>';
  html += '<div class="dock-item" data-action="video" data-app="camera"><img src="assets/icons/camera.webp" class="dock-icon" alt="Camera"/></div>';
  html += '<div class="dock-item" data-action="video" data-app="spotify"><img src="assets/icons/spotify.png" class="dock-icon" alt="Spotify"/></div>';
  html += '</div>';
  html += '</div>';

  console.log('Setting home screen HTML');
  screenContent.innerHTML = html;
  console.log('Home screen rendered with', utilityApps.length, 'apps');

  // Attach event listeners
  attachHomeScreenListeners();
}

// Attach home screen event listeners
function attachHomeScreenListeners() {
  // Folder clicks
  document.querySelectorAll('.app-icon-wrapper[data-folder]').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const folder = wrapper.dataset.folder;
      const projects = window.APP_DATA.projects.filter(p => p.folder === folder);

      folderContext = { folder, projects, index: 0 };
      navigateTo(STATES.FOLDER);
    });
  });

  // Utility app clicks
  document.querySelectorAll('.app-icon-wrapper[data-app]').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      navigateTo(STATES.VIDEO, { appId: wrapper.dataset.app });
    });
  });

  // Dock item clicks
  document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'contacts') {
        navigateTo(STATES.CONTACTS);
      } else if (action === 'notes') {
        navigateTo(STATES.NOTES);
      } else if (action === 'video') {
        navigateTo(STATES.VIDEO, { appId: item.dataset.app });
      }
    });
  });
}

// Render folder popup
function renderFolder() {
  const screenContent = getScreenContent();
  if (!screenContent || !folderContext) return;

  const { folder, projects } = folderContext;
  const folderNames = {
    'personal': 'Personal Projects',
    'open-source': 'Open Source',
    'research': 'Research',
    'coursework': 'Coursework/Learning'
  };

  let html = '<div class="view folder-popup active">';
  html += '<div class="popup-backdrop"></div>';
  html += '<div class="popup-content">';
  html += `<div class="popup-header">${folderNames[folder]}</div>`;
  html += '<div class="folder-scroll">';

  projects.forEach((project, index) => {
    const domainColor = DOMAIN_COLORS[project.category] || '#6c7ae0';
    html += `
      <div class="folder-item" data-project-id="${project.id}" data-index="${index}">
        <div class="folder-item-icon" style="background: ${domainColor};">
          ${project.title.charAt(0)}
        </div>
        <div class="folder-item-info">
          <div class="folder-item-title">${project.title}</div>
          <div class="folder-item-category">${project.category}</div>
        </div>
      </div>
    `;
  });

  html += '</div></div></div>';

  screenContent.innerHTML = html;

  // Back button
  const header = document.querySelector('.popup-header');
  if (header) {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => navigateTo(STATES.HOME));
  }

  // Folder item clicks
  document.querySelectorAll('.folder-item').forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        folderContext.index = parseInt(item.dataset.index);
        currentProject = project;
        navigateTo(STATES.PROJECT_DETAIL, project);
      }
    });
  });
}

// Render project detail
function renderProjectDetail(project) {
  const screenContent = getScreenContent();
  if (!screenContent || !project) return;

  const statusText = project.status === 'complete' ? 'Complete' : 'In Progress';
  const statusClass = project.status === 'complete' ? 'status-complete' : 'status-in-progress';
  const domainColor = DOMAIN_COLORS[project.category] || '#6c7ae0';

  let html = '<div class="view project-detail active">';
  html += '<div class="detail-header">';
  html += '<button class="back-button" id="detail-back">←</button>';
  html += `<div class="detail-icon" style="background: ${domainColor};">${project.title.charAt(0)}</div>`;
  html += `<div class="status-indicator ${statusClass}">${statusText}</div>`;
  html += '</div>';
  html += '<div class="detail-content">';
  html += `<h2 class="detail-title">${project.title}</h2>`;
  html += `<p class="detail-description">${project.description}</p>`;
  html += '<div class="tags">';

  if (project.tags && project.tags.length > 0) {
    project.tags.forEach(tag => {
      html += `<span class="tag">${tag}</span>`;
    });
  }

  html += '</div>';
  html += '<div class="action-buttons">';

  if (project.url) {
    const btnText = project.type === 'iframe' ? 'Open App' : 'Visit Site';
    html += `<a href="${project.url}" target="_blank" rel="noopener" class="action-btn action-primary" style="background: ${domainColor};">${btnText}</a>`;
  }

  if (project.github) {
    html += `<a href="${project.github}" target="_blank" rel="noopener" class="action-btn action-secondary">View Code</a>`;
  }

  html += '</div></div></div>';

  screenContent.innerHTML = html;

  // Back button handler
  const backBtn = document.getElementById('detail-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo(STATES.HOME));
  }
}

// Open video
function openVideo(appId) {
  const screenContent = getScreenContent();
  if (!screenContent || !appId) return;

  videoContext = { appId };

  let html = '<div class="view video-view active">';
  html += '<div class="placeholder-content">';
  html += '<div class="placeholder-icon">🎬</div>';
  html += '<p>Demo video coming soon</p>';
  html += '<p style="font-size: 12px; opacity: 0.7; margin-top: 8px;">' + appId + '</p>';
  html += '</div>';
  html += '<button class="back-button" id="video-close" style="position: absolute; top: 60px; right: 20px; z-index: 10;">←</button>';
  html += '</div>';

  screenContent.innerHTML = html;

  // Close handler
  const closeBtn = document.getElementById('video-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => navigateTo(STATES.HOME));
  }
}

// Render contacts card
function renderContacts() {
  const screenContent = getScreenContent();
  if (!screenContent) return;

  const profile = window.APP_DATA?.profile || {};
  const email = profile.email || 'shubhan.chari@gmail.com';
  const github = profile.github || 'https://github.com/ShubhanC';
  const linkedin = profile.linkedin || 'https://linkedin.com/in/shubhanchari';
  const resumePath = 'Resume - Shubhan Chari.pdf';

  let html = '<div class="view project-detail active">';
  html += '<div class="detail-header">';
  html += '<button class="back-button" id="contacts-back">←</button>';
  html += '<div class="detail-icon" style="background: #ffffff;"><img src="assets/icons/contacts.webp" class="detail-icon-img" alt="Contacts"/></div>';
  html += '<div style="color: white; font-weight: 600; font-size: 16px;">Contacts</div>';
  html += '</div>';
  html += '<div class="detail-content">';
  html += `<h2 class="detail-title">${profile.name || 'Shubhan Chari'}</h2>`;
  html += `<p class="detail-description">${profile.tagline || 'Data Scientist & Machine Learning Engineer'}</p>`;
  html += '<div class="contact-buttons">';
  html += `<a href="mailto:${email}" class="action-btn contact-btn" style="background: #ea4335;">📧 Email</a>`;
  html += `<a href="${github}" target="_blank" rel="noopener" class="action-btn contact-btn" style="background: #24292e;">🐙 GitHub</a>`;
  html += `<a href="${linkedin}" target="_blank" rel="noopener" class="action-btn contact-btn" style="background: #0a66c2;">💼 LinkedIn</a>`;
  html += `<a href="${encodeURI(resumePath)}" target="_blank" rel="noopener" class="action-btn contact-btn" style="background: #10b981;">📄 Resume</a>`;
  html += '</div>';
  html += '</div></div>';

  screenContent.innerHTML = html;

  const backBtn = document.getElementById('contacts-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo(STATES.HOME));
  }
}

// Render notes
function renderNotes() {
  const screenContent = getScreenContent();
  if (!screenContent) return;

  let html = '<div class="view project-detail active">';
  html += '<div class="detail-header">';
  html += '<button class="back-button" id="notes-back">←</button>';
  html += '<div class="detail-icon" style="background: #ffffff;"><img src="assets/icons/notes.svg" class="detail-icon-img" alt="Notes"/></div>';
  html += '<div style="color: white; font-weight: 600; font-size: 16px;">Notes</div>';
  html += '</div>';
  html += '<div class="detail-content">';
  html += '<div style="font-family: var(--font-notes); font-size: 18px; line-height: 1.8; color: rgba(255, 255, 255, 0.9);">';
  html += 'Hi! I\'m Shubhan, an aspiring data scientist and ML engineer.<br><br>';
  html += 'I love building cool projects with data and AI.<br><br>';
  html += 'Feel free to check out my work above — each folder represents a category of projects I\'ve worked on.';
  html += '</div>';
  html += '</div></div>';

  screenContent.innerHTML = html;

  const backBtn = document.getElementById('notes-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo(STATES.HOME));
  }
}

// Swipe-up gesture handler
function setupSwipeGesture() {
  const homeBar = document.getElementById('home-bar');
  if (!homeBar) return;

  let startY = 0;
  let isSwiping = false;

  homeBar.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    isSwiping = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isSwiping) return;
    const deltaY = startY - e.clientY;
    if (deltaY > 50 && currentState !== STATES.LOCK && currentState !== STATES.HOME) {
      isSwiping = false;
      navigateTo(STATES.HOME);
    }
  });

  document.addEventListener('mouseup', () => {
    isSwiping = false;
  });

  // Touch events
  homeBar.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isSwiping = true;
  });

  homeBar.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const deltaY = startY - e.touches[0].clientY;
    if (deltaY > 50 && currentState !== STATES.LOCK && currentState !== STATES.HOME) {
      isSwiping = false;
      navigateTo(STATES.HOME);
    }
  });

  homeBar.addEventListener('touchend', () => {
    isSwiping = false;
  });
}

// Keyboard support
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentState !== STATES.LOCK && currentState !== STATES.HOME) {
      navigateTo(STATES.HOME);
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupSwipeGesture();
  setupKeyboardNavigation();
  init();
  // Set default scale to 0.9 (90%) as requested
  setPhoneScale(0.9);
});
