var themeswitchListbox = document.getElementById('themeswitch-listbox-options');
var themeswitchListboxButton = document.getElementById('themeswitch-listbox-button');
var themeswitchListboxButtonSunIcon = document.getElementById('themeswitch-listbox-button-sun');
var themeswitchListboxButtonMoonIcon = document.getElementById('themeswitch-listbox-button-moon');

var themeswitchOptions = [...themeswitchListbox.children];
var lightOption = document.getElementById('listbox-option-light');
var lightIcon = document.getElementById('light-icon');
var lightLabel = document.getElementById('light-label');
var darkOption = document.getElementById('listbox-option-dark');
var darkIcon = document.getElementById('dark-icon');
var darkLabel = document.getElementById('dark-label');
var systemOption = document.getElementById('listbox-option-system');
var systemIcon = document.getElementById('system-icon');
var systemLabel = document.getElementById('system-label');

// For the purposes of keyboard navigation through listbox options
var themeswitchActiveOption = systemOption;

const themeswitchColorActive = 'text-sky-500';
const themeswitchColorActiveDark = 'dark:text-sky-500';
const themeswitchBGActive = 'bg-gray-100';
const themeswitchBGActiveDark = 'dark:bg-gray-700';

// Hides listbox
function hideListbox() {
  themeswitchListboxButton.setAttribute('aria-expanded', 'false')
  themeswitchListbox.classList.add('hidden');
  themeswitchListbox.blur()
}

// Displays listbox
function showListbox() {
  themeswitchListboxButton.setAttribute('aria-expanded', 'true')

  // Highlight background of selected option
  themeswitchOptions.forEach((option => {
    if (option.getAttribute('aria-selected') === 'true')
    option.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
    }
  ))

  themeswitchListbox.classList.remove('hidden')
  themeswitchListbox.focus()
}

function toggleListbox() {
  const expanded = themeswitchListboxButton.getAttribute('aria-expanded');
  if (expanded === 'true') {
    hideListbox();
  } else {
    showListbox();
  }
}

// Set initial option appearance/state
if (localStorage.getItem('theme') === 'dark') {
  unstyleAll();
  style('dark');
  switchSelectionTo('dark');
  themeswitchActiveOption = darkOption;
}
else if (localStorage.getItem('theme') === 'light') {
  unstyleAll();
  style('light');
  switchSelectionTo('light');
  themeswitchActiveOption = lightOption;
} else {
  unstyleAll();
  style('system');
  switchSelectionTo('system');
  themeswitchActiveOption = systemOption;
}

// Removes selected styles from all listbox labels and icons
function unstyleAll() {
  lightIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  lightLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  darkIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  darkLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  systemIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  systemLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
}

// Removes background style from all listbox options
function removeAllBG() {
  lightOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
  darkOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
  systemOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
}

// Manages stylistic changes when switching themes
function style(theme) {
  if (theme === 'light') {
    lightIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    lightLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchListboxButtonMoonIcon.classList.add('hidden');
    themeswitchListboxButtonSunIcon.classList.remove('hidden');
    themeswitchListboxButtonSunIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
  } else if (theme === 'dark') {
    darkIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    darkLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchListboxButtonSunIcon.classList.add('hidden');
    themeswitchListboxButtonMoonIcon.classList.remove('hidden');
    themeswitchListboxButtonMoonIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
  } else if (theme === 'system') {
    systemIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    systemLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      themeswitchListboxButtonSunIcon.classList.add('hidden');
      themeswitchListboxButtonMoonIcon.classList.remove('hidden');
      themeswitchListboxButtonMoonIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
    } else {
      themeswitchListboxButtonMoonIcon.classList.add('hidden');
      themeswitchListboxButtonSunIcon.classList.remove('hidden');
      themeswitchListboxButtonSunIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
    }
  }
}

// Manages options' aria-selected attribute on theme switch
function switchSelectionTo(theme) {
  if (theme === 'light') {
    darkOption.setAttribute('aria-selected', 'false');
    systemOption.setAttribute('aria-selected', 'false');
    lightOption.setAttribute('aria-selected', 'true');
  } else if (theme === 'dark') {
    lightOption.setAttribute('aria-selected', 'false');
    systemOption.setAttribute('aria-selected', 'false');
    darkOption.setAttribute('aria-selected', 'true');
  } else if (theme === 'system') {
    lightOption.setAttribute('aria-selected', 'false');
    darkOption.setAttribute('aria-selected', 'false');
    systemOption.setAttribute('aria-selected', 'true');
  }
}

function switchModeToDark() {
  localStorage.setItem('theme', 'dark');
  document.documentElement.classList.add('dark');
  unstyleAll();
  style('dark');
  switchSelectionTo('dark');
  hideListbox();
}

function switchModeToLight() {
  localStorage.setItem('theme', 'light');
  document.documentElement.classList.remove('dark');
  unstyleAll();
  style('light');
  switchSelectionTo('light');
  hideListbox();
}

function switchModeToSystem() {
  localStorage.removeItem('theme')
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  unstyleAll();
  style('system');
  switchSelectionTo('system');
  hideListbox();
}

// Toggle listbox visibility when clicking themeswitchListboxButton
themeswitchListboxButton.addEventListener('click', function () {
  toggleListbox();
  themeswitchListboxButton.blur();
});

// Switch modes when clicking options
darkOption.addEventListener('click', switchModeToDark);
lightOption.addEventListener('click', switchModeToLight);
systemOption.addEventListener('click', switchModeToSystem);

// Hide listbox when clicking outside listbox
document.addEventListener('mouseup', function(event) {
  if ((!themeswitchListbox.contains(event.target)) && (!themeswitchListboxButton.contains(event.target))) {
    hideListbox();
  }
});

// We highlight bg of selected option when opening listbox
// but then switch to mouse-hover-based bg highlighting.
themeswitchOptions.forEach(element => element.addEventListener('mouseenter', function(event) {
  removeAllBG();
  element.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchActiveOption = element;
}));
themeswitchListbox.addEventListener('mouseleave', function(event) {
  removeAllBG();
});

// Cycle through options with arrow keys
themeswitchListbox.addEventListener('keydown', function(event) {
  if(event.key === "Escape") {
    hideListbox();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();   // prevent page from scrolling down
    movedToOption = nextOption(themeswitchActiveOption);
    removeAllBG();
    movedToOption.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
    themeswitchActiveOption = movedToOption;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();   // prevent page from scrolling up
    movedToOption = prevOption(themeswitchActiveOption);
    removeAllBG();
    movedToOption.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
    themeswitchActiveOption = movedToOption;
  } else if (event.key === 'Enter') {
    if (themeswitchActiveOption == lightOption) {
      switchModeToLight();
    } else if (themeswitchActiveOption == darkOption) {
      switchModeToDark();
    } else {
      switchModeToSystem();
    }
  }
});

function nextOption(option) {
  if (option == lightOption) {
    return darkOption;
  } else if (option == darkOption) {
    return systemOption;
  } else {
    return lightOption;
  }
}

function prevOption(option) {
  if (option == lightOption) {
    return systemOption;
  } else if (option == darkOption) {
    return lightOption;
  } else {
    return darkOption;
  }
}
