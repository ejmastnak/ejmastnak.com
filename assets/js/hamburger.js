var hamburgerContainer = document.getElementById('hamburger-container');
hamburgerContainer.classList.remove('hidden');

var hamburgerListbox = document.getElementById('hamburger-listbox');
var hamburgerButton = document.getElementById('hamburger-button');
var hamburgerButtonHamburgerIcon = document.getElementById('hamburger-button-hamburger-icon');
var hamburgerButtonXMarkIcon = document.getElementById('hamburger-button-xmark-icon');

var hamburgerMenuItems = [...hamburgerListbox.children];
var hamburgerMenuLinks = hamburgerMenuItems.map(item => item.querySelectorAll('a')[0]);

// Used for keyboard navigation through menu items
var hamburgerActiveItem = null;

// Classes used to style background of active item
const hamburgerBGActive = 'bg-gray-100';
const hamburgerBGActiveDark = 'dark:bg-gray-700';

function hideHamburgerMenu() {
  hamburgerButton.setAttribute('aria-expanded', 'false')
  hamburgerListbox.classList.add('hidden');
  hamburgerListbox.blur()
}

function showHamburgerMenu() {
  hamburgerButton.setAttribute('aria-expanded', 'true')
  hamburgerListbox.classList.remove('hidden');
  hamburgerListbox.focus()
}

function toggleHamburgerMenu() {
  const expanded = hamburgerButton.getAttribute('aria-expanded');
  expanded === 'true' ? hideHamburgerMenu() : showHamburgerMenu(); 
}

function removeAllHamburgerBG() {
  hamburgerMenuItems.forEach(item => item.classList.remove(hamburgerBGActive, hamburgerBGActiveDark));
}

// Toggle listbox visibility when clicking listboxButton
hamburgerButton.addEventListener('click', function () {
  toggleHamburgerMenu();
  hamburgerButton.blur();
});

// Hide listbox when clicking outside listbox
document.addEventListener('mouseup', function(event) {
  if ((!hamburgerListbox.contains(event.target)) && (!hamburgerButton.contains(event.target))) {
    hideHamburgerMenu();
  }
});

// Highlight option on mouse hover
hamburgerMenuItems.forEach(item => item.addEventListener('mouseenter', function(event) {
  removeAllHamburgerBG();
  item.classList.add(hamburgerBGActive, hamburgerBGActiveDark);
  hamburgerActiveItem = item;
}));

// Remove highlighting when mouse leaves menu
hamburgerListbox.addEventListener('mouseleave', function(event) {
  removeAllHamburgerBG();
  hamburgerActiveItem = null;
});

// Cycle through menu items with arrow keys
hamburgerListbox.addEventListener('keydown', function(event) {
  if(event.key === "Escape") {
    hideHamburgerMenu();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();   // prevent page from scrolling down
    moveToNextHamburgerItem();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();   // prevent page from scrolling down
    moveToPrevHamburgerItem();
  } else if (event.shiftKey && event.key == "Tab") {
    event.preventDefault();   // trap focus in menu
    moveToPrevHamburgerItem();
  } else if (event.key == "Tab") {
    event.preventDefault();   // trap focus in menu
    moveToNextHamburgerItem();
  }
});

// Used with arrow key and tab navigation to move focus/selection to next item
function moveToNextHamburgerItem() {
  idx = nextHamburgerIdx();
  removeAllHamburgerBG();
  hamburgerMenuItems[idx].classList.add(hamburgerBGActive, hamburgerBGActiveDark);
  hamburgerActiveItem = hamburgerMenuItems[idx];
  hamburgerMenuLinks[idx].focus();
}

// Used with arrow key and tab navigation to move focus/selection to previous item
function moveToPrevHamburgerItem() {
  idx = prevHamburgerIdx();
  removeAllHamburgerBG();
  hamburgerMenuItems[idx].classList.add(hamburgerBGActive, hamburgerBGActiveDark);
  hamburgerActiveItem = hamburgerMenuItems[idx];
  hamburgerMenuLinks[idx].focus();
}

// Returns the index of the menu item after currently active item
function nextHamburgerIdx() {
  if (hamburgerActiveItem === null) return 0; 
  // I initialized idx to the last item's index as a safety mechanism---this
  // returns the first item if no match is found.
  var idx = hamburgerMenuItems.length - 1;
  for (var i = 0; i < hamburgerMenuItems.length; i++) {
    if (hamburgerMenuItems[i].id === hamburgerActiveItem.id) {
      idx = i;
      break;
    }
  }
  return (idx === hamburgerMenuItems.length - 1) ? 0 : idx + 1;
}

// Returns the index of the menu item before currently active item
function prevHamburgerIdx() {
  if (hamburgerActiveItem === null) return hamburgerMenuItems.length - 1; 
  // I initialized idx to the first item's index as a safety mechanism---this
  // returns the last item if no match is found.
  var idx = 0;
  for (var i = 0; i < hamburgerMenuItems.length; i++) {
    if (hamburgerMenuItems[i].id === hamburgerActiveItem.id) {
      idx = i;
      break;
    }
  }
  return (idx === 0) ? hamburgerMenuItems.length - 1 : idx - 1;
}
