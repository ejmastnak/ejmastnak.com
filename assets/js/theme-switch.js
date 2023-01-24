var listbox = document.getElementById('listbox-options');
var listboxButton = document.getElementById('listbox-button');
var listboxButtonSunIcon = document.getElementById('listbox-button-sun');
var listboxButtonMoonIcon = document.getElementById('listbox-button-moon');

var options = [...listbox.children];
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
var activeOption = systemOption;

const colorOn = 'text-sky-500';
const colorOnDark = 'dark:text-sky-500';
const bgActive = 'bg-gray-100';
const bgActiveDark = 'dark:bg-gray-700';

// Hides listbox
function hideListbox() {
  listboxButton.setAttribute('aria-expanded', 'false')
  listbox.classList.add('hidden');
  listbox.blur()
}

// Displays listbox
function showListbox() {
  listboxButton.setAttribute('aria-expanded', 'true')

  // Highlight background of selected option
  if (lightOption.getAttribute('aria-selected') == 'true') {
    lightOption.classList.add(bgActive, bgActiveDark);
  } else if (darkOption.getAttribute('aria-selected') == 'true') {
    darkOption.classList.add(bgActive, bgActiveDark);
  }  else if (systemOption.getAttribute('aria-selected') == 'true') {
    systemOption.classList.add(bgActive, bgActiveDark);
  }

  listbox.classList.remove('hidden');
  listbox.focus()
}

function toggleListbox() {
  const expanded = listboxButton.getAttribute('aria-expanded');
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
  activeOption = darkOption;
}
else if (localStorage.getItem('theme') === 'light') {
  unstyleAll();
  style('light');
  switchSelectionTo('light');
  activeOption = lightOption;
} else {
  unstyleAll();
  style('system');
  switchSelectionTo('system');
  activeOption = systemOption;
}

// Removes selected styles from all listbox labels and icons
function unstyleAll() {
  lightIcon.classList.remove(colorOn, colorOnDark);
  lightLabel.classList.remove(colorOn, colorOnDark);
  darkIcon.classList.remove(colorOn, colorOnDark);
  darkLabel.classList.remove(colorOn, colorOnDark);
  systemIcon.classList.remove(colorOn, colorOnDark);
  systemLabel.classList.remove(colorOn, colorOnDark);
}

// Removes background style from all listbox options
function removeAllBG() {
  lightOption.classList.remove(bgActive, bgActiveDark);
  darkOption.classList.remove(bgActive, bgActiveDark);
  systemOption.classList.remove(bgActive, bgActiveDark);
}

// Manages stylistic changes when switching themes
function style(theme) {
  if (theme === 'light') {
    lightIcon.classList.add(colorOn, colorOnDark);
    lightLabel.classList.add(colorOn, colorOnDark);
    listboxButtonMoonIcon.classList.add('hidden');
    listboxButtonSunIcon.classList.remove('hidden');
    listboxButtonSunIcon.classList.add(colorOn, colorOnDark);
  } else if (theme === 'dark') {
    darkIcon.classList.add(colorOn, colorOnDark);
    darkLabel.classList.add(colorOn, colorOnDark);
    listboxButtonSunIcon.classList.add('hidden');
listboxButtonMoonIcon.classList.remove('hidden');
listboxButtonMoonIcon.classList.add(colorOn, colorOnDark);
  } else if (theme === 'system') {
    systemIcon.classList.add(colorOn, colorOnDark);
    systemLabel.classList.add(colorOn, colorOnDark);
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      listboxButtonSunIcon.classList.add('hidden');
      listboxButtonMoonIcon.classList.remove('hidden');
      listboxButtonMoonIcon.classList.remove(colorOn, colorOnDark);
    } else {
      listboxButtonMoonIcon.classList.add('hidden');
      listboxButtonSunIcon.classList.remove('hidden');
      listboxButtonSunIcon.classList.remove(colorOn, colorOnDark);
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

// Toggle listbox visibility when clicking listboxButton
listboxButton.addEventListener('click', function () {
  toggleListbox();
  listboxButton.blur();
});

// Switch modes when clicking options
darkOption.addEventListener('click', switchModeToDark);
lightOption.addEventListener('click', switchModeToLight);
systemOption.addEventListener('click', switchModeToSystem);

// Hide listbox when clicking outside listbox
document.addEventListener('mouseup', function(event) {
  if ((!listbox.contains(event.target)) && (!listboxButton.contains(event.target))) {
    hideListbox();
  }
});

// We highlight bg of selected option when opening listbox
// but then switch to mouse-hover-based bg highlighting.
options.forEach(element => element.addEventListener('mouseenter', function(event) {
  removeAllBG();
  element.classList.add(bgActive, bgActiveDark);
  activeOption = element;
}));
listbox.addEventListener('mouseleave', function(event) {
  removeAllBG();
});

// Cycle through options with arrow keys
listbox.addEventListener('keydown', function(event) {
  if(event.key === "Escape") {
    hideListbox();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();   // prevent page from scrolling down
    movedToOption = nextOption(activeOption);
    removeAllBG();
    movedToOption.classList.add(bgActive, bgActiveDark);
activeOption = movedToOption;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();   // prevent page from scrolling up
    movedToOption = prevOption(activeOption);
    removeAllBG();
    movedToOption.classList.add(bgActive, bgActiveDark);
    activeOption = movedToOption;
  } else if (event.key === 'Enter') {
    if (activeOption == lightOption) {
      switchModeToLight();
    } else if (activeOption == darkOption) {
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
