document.addEventListener('DOMContentLoaded', () => {
  const platforms = ['ios', 'android', 'windows'];
  let currentPlatform = 'ios';
  let currentVersion = null;
  let appData = [];

  const platformButtons = {
    ios: document.getElementById('ios-btn'),
    android: document.getElementById('android-btn'),
    windows: document.getElementById('windows-btn'),
  };

  const versionDropdown = document.getElementById('version-dropdown');
  const appContainer = document.getElementById('app-container');

  // Fetch app data from JSON
  fetch('apps.json')
    .then(response => response.json())
    .then(data => {
      appData = data;
      initializePlatform(currentPlatform);
    })
    .catch(error => console.error('Error fetching app data:', error));

  // Initialize platform view
  function initializePlatform(platform) {
    currentPlatform = platform;
    currentVersion = null;
    updateActiveButton();
    populateVersionDropdown();
    renderApps();
  }

  // Update active button styling
  function updateActiveButton() {
    platforms.forEach(p => {
      platformButtons[p].classList.toggle('active', p === currentPlatform);
    });
  }

  // Populate version dropdown based on selected platform
  function populateVersionDropdown() {
    const versions = new Set();
    appData.forEach(app => {
      if (app.platform === currentPlatform && Array.isArray(app.versions)) {
        app.versions.forEach(v => versions.add(v));
      }
    });

    const sortedVersions = Array.from(versions).sort((a, b) => b - a);

    if (sortedVersions.length === 0) {
      versionDropdown.innerHTML = '';
      return;
    }

    const select = document.createElement('select');
    select.innerHTML = '<option value="">Select Version</option>';
    sortedVersions.forEach(version => {
      const option = document.createElement('option');
      option.value = version;
      option.textContent = version;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      currentVersion = select.value;
      renderApps();
    });

    versionDropdown.innerHTML = '';
    versionDropdown.appendChild(select);
  }

  // Render apps based on selected platform and version
  function renderApps() {
    appContainer.innerHTML = '';

    const filteredApps = appData.filter(app => {
      if (app.platform !== currentPlatform) return false;
      if (currentVersion && Array.isArray(app.versions)) {
        return app.versions.includes(parseInt(currentVersion));
      }
      return true;
    });

    if (filteredApps.length === 0) {
      appContainer.innerHTML = '<p>No apps available for the selected criteria.</p>';
      return;
    }

    filteredApps.forEach(app => {
      const card = document.createElement('div');
      card.className = 'app-card';

      const icon = document.createElement('img');
      icon.className = 'app-icon';
      icon.src = app.icon || '';
      icon.alt = `${app.title} icon`;

      const title = document.createElement('h3');
      title.textContent = app.title;

      const description = document.createElement('p');
      description.textContent = app.description || '';

      const installBtn = document.createElement('a');
      installBtn.className = 'install-btn';
      installBtn.textContent = 'Install';

      // Set install link based on platform
      if (currentPlatform === 'ios' && app.plist) {
        installBtn.href = `itms-services://?action=download-manifest&url=${encodeURIComponent(app.plist)}`;
      } else if (currentPlatform === 'android' && app.apk) {
        installBtn.href = app.apk;
        installBtn.setAttribute('download', '');
      } else if (currentPlatform === 'windows' && app.appx) {
        installBtn.href = app.appx;
        installBtn.setAttribute('download', '');
      } else {
        installBtn.href = '#';
        installBtn.addEventListener('click', e => e.preventDefault());
      }

      card.appendChild(icon);
      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(installBtn);

      appContainer.appendChild(card);
    });
  }

  // Add event listeners to platform buttons
  platforms.forEach(platform => {
    platformButtons[platform].addEventListener('click', () => {
      if (currentPlatform !== platform) {
        initializePlatform(platform);
      }
    });
  });
});
