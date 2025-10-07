// js/transitions.js

/**
 * Handles the fade-out effect and navigates to a new page.
 * @param {string} url - The URL of the page to transition to.
 */
function transitionToPage(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = url;
  }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.add('fade-in');
  }, 50);
});


const transitionLinks = document.querySelectorAll('a[data-transition-link]');

transitionLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); 
    const destinationUrl = link.href;
    transitionToPage(destinationUrl);
  });
});