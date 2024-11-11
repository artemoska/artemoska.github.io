// Открытие и закрытие модального окна
const themeButton = document.getElementById('theme-button');
const themeModal = document.getElementById('theme-modal');
const closeButton = document.querySelector('.close-button');

themeButton.addEventListener('click', () => {
  themeModal.style.display = 'flex';
});

closeButton.addEventListener('click', () => {
  themeModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === themeModal) {
    themeModal.style.display = 'none';
  }
});

// Переключение темы
const gradientThemeButton = document.getElementById('gradient-theme');
const lightThemeButton = document.getElementById('light-theme');
const darkThemeButton = document.getElementById('dark-theme');

gradientThemeButton.addEventListener('click', () => {
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add('gradient-theme');
  localStorage.setItem('theme', 'gradient');
  themeModal.style.display = 'none';
});

lightThemeButton.addEventListener('click', () => {
  document.body.classList.remove('gradient-theme', 'dark-theme');
  document.body.classList.add('light-theme');
  localStorage.setItem('theme', 'light');
  themeModal.style.display = 'none';
});

darkThemeButton.addEventListener('click', () => {
  document.body.classList.remove('gradient-theme', 'light-theme');
  document.body.classList.add('dark-theme');
  localStorage.setItem('theme', 'dark');
  themeModal.style.display = 'none';
});

// Сохранение выбранной темы
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.add(
      savedTheme === 'dark' ? 'dark-theme' :
      savedTheme === 'light' ? 'light-theme' : 'gradient-theme'
    );
  }
});
