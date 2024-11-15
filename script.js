const aboutSection = document.querySelector('.about-section');
let observerAdded = false;

function isAtPageEnd() {
  return (
    window.scrollY + window.innerHeight >=
    (document.body.scrollHeight || document.documentElement.scrollHeight)
  );
}

function addVisibleClassIfNeeded() {
  if (isAtPageEnd()) {
    if (!observerAdded) {
      aboutSection.classList.add('visible');
      window.removeEventListener('scroll', addVisibleClassIfNeeded);
      observerAdded = true;
    }
  }
}

addVisibleClassIfNeeded();

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("scroll", debounce(addVisibleClassIfNeeded, 150));
});

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
