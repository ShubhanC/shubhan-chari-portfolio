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

const VIDEO_SOURCES = {
  google_maps: 'assets/videos/google_maps.mp4',
  photos: 'assets/videos/photos.mp4',
  pinterest: 'assets/videos/pinterest.mp4',
  github: 'assets/videos/github.mp4'
};

// Global state
let currentState = null;
let isAnimating = false;
let folderContext = null;
let homeFocusSelector = null;

// Lazy DOM access - gets elements when needed, not at load time
function getScreenContent() {
  return document.getElementById('screen-content');
}

function showError(message, buttonLabel, retry) {
  const screen = getScreenContent();
  screen.innerHTML = '<div class="screen-message"><p role="alert"></p><button type="button" class="retry-button"></button></div>';
  screen.querySelector('p').textContent = message;
  const button = screen.querySelector('button');
  button.textContent = buttonLabel;
  button.addEventListener('click', retry);
  return button;
}

// Load data and initialize
async function init() {
  const screen = getScreenContent();
  const restoreFocus = screen.contains(document.activeElement);
  screen.innerHTML = '<div class="screen-message" role="status">Loading portfolio…</div>';
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`Project request failed (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data?.projects) || !data.projects.every(project =>
      project && ['id', 'folder', 'title', 'category', 'description'].every(
        key => typeof project[key] === 'string'
      ) && (project.tags == null || (
        Array.isArray(project.tags) && project.tags.every(tag => typeof tag === 'string')
      ))
    )) throw new Error('Invalid project data');

    window.APP_DATA = data;
    renderLockScreen();
    if (restoreFocus) screen.querySelector('button').focus();
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    showError('Could not load the portfolio.', 'Retry', init).focus();
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
      <button type="button" class="unlock-hint" aria-label="Unlock portfolio">Tap to unlock</button>
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

function fitPhoneToViewport() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const padding = 2 * parseFloat(styles.getPropertyValue('--phone-frame-padding'));
  const width = parseFloat(styles.getPropertyValue('--phone-width')) + padding;
  const height = parseFloat(styles.getPropertyValue('--phone-height')) + padding;
  const scale = Math.min(0.8, (root.clientWidth - 24) / width, (root.clientHeight - 24) / height);
  root.style.setProperty('--phone-scale', scale);
}

// Navigate to state
async function navigateTo(state, data = {}) {
  console.log('Navigating to state:', state);
  if (isAnimating) return;
  isAnimating = true;

  const screenContent = getScreenContent();

  const homeBar = document.getElementById('home-bar');
  try {
    screenContent.querySelector('#app-video')?.pause();

    // Start playback in the icon's click handler so mobile browsers allow audio.
    if (state === STATES.VIDEO && VIDEO_SOURCES[data.appId]) {
      openVideo(data.appId);
    } else {
      screenContent.inert = true;
      await fadeTransition(screenContent, 1, 0, 150);
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
      await fadeTransition(screenContent, 0, 1, 200);
    }
    currentState = state;
    homeBar.disabled = state === STATES.HOME;
    screenContent.inert = false;
    const focusTarget = state === STATES.HOME ? '.home-screen' : 'button:not([hidden])';
    (screenContent.querySelector(focusTarget) || homeBar).focus();
  } catch (error) {
    console.error('Could not open portfolio view:', error);
    screenContent.style.opacity = '1';
    screenContent.inert = false;
    showError('Could not open this screen.', 'Return home', () => navigateTo(STATES.HOME)).focus();
  } finally {
    isAnimating = false;
  }
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

  let html = '<div class="view home-screen" tabindex="-1">';
  html += '<div class="home-grid">';

  // Render folder icons
  activeFolders.forEach(folder => {
    const miniIcons = folderProjects[folder]
      .slice(0, 4)
      .map(() => '<span class="mini-icon"></span>')
      .join('');

    html += `
      <button type="button" class="app-icon-wrapper" data-folder="${folder}">
        <span class="app-icon folder-icon" aria-hidden="true">
          <span class="mini-icons">${miniIcons}</span>
        </span>
        <span class="app-label">${folderNames[folder]}</span>
      </button>
    `;
  });

  // Render utility apps
  utilityApps.forEach(app => {
    html += `
      <button type="button" class="app-icon-wrapper" data-app="${app.appId}">
        <span class="app-icon" style="background-image: url('assets/icons/${app.appId}.${app.ext}'); background-size: contain; background-position: center; background-repeat: no-repeat;"></span>
        <span class="app-label">${app.name}</span>
      </button>
    `;
  });

  html += '</div>';
  html += '<div class="dock">';
  html += '<button type="button" class="dock-item" data-action="contacts"><img src="assets/icons/contacts.webp" class="dock-icon" alt="Contacts"/></button>';
  html += '<button type="button" class="dock-item" data-action="notes"><img src="assets/icons/notes.svg" class="dock-icon" alt="Notes"/></button>';
  html += '<button type="button" class="dock-item" data-action="video" data-app="camera"><img src="assets/icons/camera.webp" class="dock-icon" alt="Camera"/></button>';
  html += '<button type="button" class="dock-item" data-action="video" data-app="spotify"><img src="assets/icons/spotify.png" class="dock-icon" alt="Spotify"/></button>';
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
  // Capture the launcher before navigation replaces the home screen.
  document.querySelector('.home-screen').addEventListener('click', event => {
    const button = event.target.closest('button');
    const key = button && ['folder', 'app', 'action'].find(key => button.dataset[key]);
    if (key) homeFocusSelector = `button[data-${key}="${CSS.escape(button.dataset[key])}"]`;
  }, { capture: true });

  // Folder clicks
  document.querySelectorAll('.app-icon-wrapper[data-folder]').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const folder = wrapper.dataset.folder;
      const projects = window.APP_DATA.projects.filter(p => p.folder === folder);

      folderContext = { folder, projects };
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
  html += `<button type="button" class="popup-header" aria-label="${folderNames[folder]} — return home">${folderNames[folder]}</button>`;
  html += '<div class="folder-scroll">';

  projects.forEach(project => {
    const domainColor = DOMAIN_COLORS[project.category] || '#6c7ae0';
    html += `
      <button type="button" class="folder-item" data-project-id="${project.id}">
        <span class="folder-item-icon" style="background: ${domainColor};" aria-hidden="true">
          ${project.title.charAt(0)}
        </span>
        <span class="folder-item-info">
          <span class="folder-item-title">${project.title}</span>
          <span class="folder-item-category">${project.category}</span>
        </span>
      </button>
    `;
  });

  html += '</div></div></div>';

  screenContent.innerHTML = html;

  // Back button
  const header = document.querySelector('.popup-header');
  if (header) {
    header.addEventListener('click', () => navigateTo(STATES.HOME));
  }

  // Folder item clicks
  document.querySelectorAll('.folder-item').forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
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
  html += '<button type="button" class="back-button" id="detail-back" aria-label="Return home">←</button>';
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

  const source = VIDEO_SOURCES[appId];
  if (source) {
    screenContent.innerHTML = `
      <div class="view video-view active">
        <video id="app-video" src="${source}" playsinline preload="auto"></video>
        <button type="button" class="video-error" id="video-error" hidden>Unable to play this video. Return home.</button>
      </div>
    `;

    const video = document.getElementById('app-video');
    const errorMessage = document.getElementById('video-error');
    const returnHome = () => navigateTo(STATES.HOME);
    video.addEventListener('click', returnHome);
    video.addEventListener('ended', returnHome);
    errorMessage.addEventListener('click', returnHome);
    video.addEventListener('error', () => {
      video.hidden = true;
      errorMessage.hidden = false;
    });
    video.play().catch(() => {
      // Allow manual playback if the browser blocks the initial play request.
      video.removeEventListener('click', returnHome);
      video.controls = true;
      video.addEventListener('play', () => {
        video.controls = false;
        video.addEventListener('click', returnHome);
      }, { once: true });
    });
    return;
  }

  const html = `
    <button type="button" class="view video-view video-placeholder-view active" aria-label="Demo video coming soon. Return home.">
      <span class="placeholder-content">
        <span class="placeholder-icon" aria-hidden="true">🎬</span>
        <span>Demo video coming soon</span>
      </span>
    </button>
  `;

  screenContent.innerHTML = html;
  screenContent.querySelector('.video-view').addEventListener('click', () => navigateTo(STATES.HOME));
}

// Render contacts card
function renderContacts() {
  const screenContent = getScreenContent();
  if (!screenContent) return;

  const profile = window.APP_DATA?.profile || {};
  const email = profile.email || 'shubhan.chari@gmail.com';
  const github = profile.github || 'https://github.com/ShubhanC';
  const linkedin = profile.linkedin || 'https://linkedin.com/in/shubhanchari';
  const resumePath = 'Shubhan_ML_Resume.pdf';

  let html = '<div class="view project-detail active">';
  html += '<div class="detail-header">';
  html += '<button type="button" class="back-button" id="contacts-back" aria-label="Return home">←</button>';
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
  html += '<button type="button" class="back-button" id="notes-back" aria-label="Return home">←</button>';
  html += '<div class="detail-icon" style="background: #ffffff;"><img src="assets/icons/notes.svg" class="detail-icon-img" alt="Notes"/></div>';
  html += '<div style="color: white; font-weight: 600; font-size: 16px;">Notes</div>';
  html += '</div>';
  html += '<div class="detail-content">';
  html += '<div style="font-family: var(--font-notes); font-size: 18px; line-height: 1.8; color: rgba(255, 255, 255, 0.9);">';
  html += 'Hi! I\'m Shubhan, a Statistics & Computer Science student at the University of Illinois, and currently a Machine Learning / Java Engineering Intern for Kencor Health.<br><br>';
  html += 'I\'m interested in machine learning and software, but I also enjoy graphic design, listening to music, and more! <br><br>';
  html += 'Feel free to check out my work above or any of the other folders. Each folder represents a category of projects I\'ve worked on. I also have other apps that are more about me, so have fun exploring those! You will see things about my marketing work for ACM at UIUC, the music I listen to, the places I visit, and more!<br><br>';
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

  homeBar.addEventListener('click', () => navigateTo(STATES.HOME));

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
  const root = document.documentElement;
  root.classList.add('pointer-navigation');
  document.addEventListener('pointerdown', () => root.classList.add('pointer-navigation'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      root.classList.remove('pointer-navigation');
      if (!e.shiftKey && homeFocusSelector && document.activeElement.matches('.home-screen')) {
        const launcher = document.activeElement.querySelector(homeFocusSelector);
        if (launcher) {
          e.preventDefault();
          launcher.focus();
        }
      }
    }
    if (e.key === 'Escape' && currentState && currentState !== STATES.LOCK && currentState !== STATES.HOME) {
      navigateTo(STATES.HOME);
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fitPhoneToViewport();
  window.addEventListener('resize', fitPhoneToViewport);
  setupSwipeGesture();
  setupKeyboardNavigation();
  init();
});
