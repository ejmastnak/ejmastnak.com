var themeswitchContainer = document.getElementById('themeswitch-container');
themeswitchContainer.classList.remove('hidden');

var themeswitchListbox = document.getElementById('themeswitch-listbox-options');
var themeswitchListboxButton = document.getElementById('themeswitch-listbox-button');
var themeswitchListboxButtonSunIcon = document.getElementById('themeswitch-listbox-button-sun');
var themeswitchListboxButtonMoonIcon = document.getElementById('themeswitch-listbox-button-moon');

var themeswitchOptions = [...themeswitchListbox.children];
var themeswitchLightOption = document.getElementById('themeswitch-light-option');
var themeswitchLightIcon = document.getElementById('themeswitch-light-icon');
var themeswitchLightLabel = document.getElementById('themeswitch-light-label');
var themeswitchDarkOption = document.getElementById('themeswitch-dark-option');
var themeswitchDarkIcon = document.getElementById('themeswitch-dark-icon');
var themeswitchDarkLabel = document.getElementById('themeswitch-dark-label');
var themeswitchSystemOption = document.getElementById('themeswitch-system-option');
var themeswitchSystemIcon = document.getElementById('themeswitch-system-icon');
var themeswitchSystemLabel = document.getElementById('themeswitch-system-label');

// For the purposes of keyboard navigation through listbox options
var themeswitchActiveOption = themeswitchSystemOption;

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
  expanded === 'true' ? hideListbox() : showListbox();
}

// Set initial active option based on local storage
if (localStorage.getItem('theme') === 'dark') {
  unstyleAll();
  switchActiveStyleTo('dark');
  switchSelectedAttributeTo('dark');
  themeswitchActiveOption = themeswitchDarkOption;
}
else if (localStorage.getItem('theme') === 'light') {
  unstyleAll();
  switchActiveStyleTo('light');
  switchSelectedAttributeTo('light');
  themeswitchActiveOption = themeswitchLightOption;
} else {
  unstyleAll();
  switchActiveStyleTo('system');
  switchSelectedAttributeTo('system');
  themeswitchActiveOption = themeswitchSystemOption;
}

// Removes selected styles from all listbox labels and icons
function unstyleAll() {
  themeswitchLightIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  themeswitchLightLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  themeswitchDarkIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  themeswitchDarkLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  themeswitchSystemIcon.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
  themeswitchSystemLabel.classList.remove(themeswitchColorActive, themeswitchColorActiveDark);
}

// Removes background style from all listbox options
function removeAllBG() {
  themeswitchLightOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchDarkOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchSystemOption.classList.remove(themeswitchBGActive, themeswitchBGActiveDark);
}

// Manages stylistic changes when switching themes
function switchActiveStyleTo(theme) {
  if (theme === 'light') {
    themeswitchLightIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchLightLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchListboxButtonMoonIcon.classList.add('hidden');
    themeswitchListboxButtonSunIcon.classList.remove('hidden');
    themeswitchListboxButtonSunIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
  } else if (theme === 'dark') {
    themeswitchDarkIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchDarkLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchListboxButtonSunIcon.classList.add('hidden');
    themeswitchListboxButtonMoonIcon.classList.remove('hidden');
    themeswitchListboxButtonMoonIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
  } else if (theme === 'system') {
    themeswitchSystemIcon.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
    themeswitchSystemLabel.classList.add(themeswitchColorActive, themeswitchColorActiveDark);
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
function switchSelectedAttributeTo(theme) {
  if (theme === 'light') {
    themeswitchDarkOption.setAttribute('aria-selected', 'false');
    themeswitchSystemOption.setAttribute('aria-selected', 'false');
    themeswitchLightOption.setAttribute('aria-selected', 'true');
  } else if (theme === 'dark') {
    themeswitchLightOption.setAttribute('aria-selected', 'false');
    themeswitchSystemOption.setAttribute('aria-selected', 'false');
    themeswitchDarkOption.setAttribute('aria-selected', 'true');
  } else if (theme === 'system') {
    themeswitchLightOption.setAttribute('aria-selected', 'false');
    themeswitchDarkOption.setAttribute('aria-selected', 'false');
    themeswitchSystemOption.setAttribute('aria-selected', 'true');
  }
}

function switchModeToDark() {
  localStorage.setItem('theme', 'dark');
  document.documentElement.classList.add('dark');
  unstyleAll();
  switchActiveStyleTo('dark');
  switchSelectedAttributeTo('dark');
  hideListbox();
}

function switchModeToLight() {
  localStorage.setItem('theme', 'light');
  document.documentElement.classList.remove('dark');
  unstyleAll();
  switchActiveStyleTo('light');
  switchSelectedAttributeTo('light');
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
  switchActiveStyleTo('system');
  switchSelectedAttributeTo('system');
  hideListbox();
}

// Toggle listbox visibility when clicking themeswitchListboxButton
themeswitchListboxButton.addEventListener('click', function () {
  toggleListbox();
  themeswitchListboxButton.blur();
});

// Switch modes when clicking options
themeswitchDarkOption.addEventListener('click', switchModeToDark);
themeswitchLightOption.addEventListener('click', switchModeToLight);
themeswitchSystemOption.addEventListener('click', switchModeToSystem);

// Hide listbox when clicking outside listbox
document.addEventListener('mouseup', function(event) {
  if ((!themeswitchListbox.contains(event.target)) && (!themeswitchListboxButton.contains(event.target))) {
    hideListbox();
  }
});

// Highlight option on mouse hover
themeswitchOptions.forEach(option => option.addEventListener('mouseenter', function(event) {
  removeAllBG();
  option.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchActiveOption = option;
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
    moveToNextThemeswitchOption();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();   // prevent page from scrolling up
    moveToPrevThemeswitchOption();
  } else if (event.shiftKey && event.key == "Tab") {
    event.preventDefault();   // trap focus in menu
    moveToPrevThemeswitchOption();
  } else if (event.key == "Tab") {
    event.preventDefault();   // trap focus in menu
    moveToNextThemeswitchOption();
  } else if (event.key === 'Enter') {
    if (themeswitchActiveOption == themeswitchLightOption) {
      switchModeToLight();
    } else if (themeswitchActiveOption == themeswitchDarkOption) {
      switchModeToDark();
    } else {
      switchModeToSystem();
    }
  }
});

// Used with arrow key and tab navigation to move selection to next option
function moveToNextThemeswitchOption() {
  movedToOption = nextOption();
  removeAllBG();
  movedToOption.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchActiveOption = movedToOption;
}

// Used with arrow key and tab navigation to move selection to previous option
function moveToPrevThemeswitchOption() {
  movedToOption = prevOption();
  removeAllBG();
  movedToOption.classList.add(themeswitchBGActive, themeswitchBGActiveDark);
  themeswitchActiveOption = movedToOption;
}

// Returns the option after currently active option; hardcoding seems simpler
// than looping over options in this case, since options never change.
function nextOption() {
  if (themeswitchActiveOption == themeswitchLightOption) {
    return themeswitchDarkOption;
  } else if (themeswitchActiveOption == themeswitchDarkOption) {
    return themeswitchSystemOption;
  } else {
    return themeswitchLightOption;
  }
}

// Returns the option before currently active option; hardcoding seems simpler
// than looping over options in this case, since options never change.
function prevOption() {
  if (themeswitchActiveOption == themeswitchLightOption) {
    return themeswitchSystemOption;
  } else if (themeswitchActiveOption == themeswitchDarkOption) {
    return themeswitchLightOption;
  } else {
    return themeswitchDarkOption;
  }
}
