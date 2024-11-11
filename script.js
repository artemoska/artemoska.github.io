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

// Переключение градиента
const defaultGradientButton = document.getElementById('default-gradient');
const grayGradientButton = document.getElementById('gray-gradient');
const rainbowGradientButton = document.getElementById('rainbow-gradient');

defaultGradientButton.addEventListener('click', () => {
  document.body.classList.remove('gray-gradient', 'rainbow-gradient');
  document.body.classList.add('gradient-theme');
  localStorage.setItem('gradient', 'default');
  themeModal.style.display = 'none';
});

grayGradientButton.addEventListener('click', () => {
  document.body.classList.remove('gradient-theme', 'rainbow-gradient');
  document.body.classList.add('gray-gradient');
  localStorage.setItem('gradient', 'gray');
  themeModal.style.display = 'none';
});

rainbowGradientButton.addEventListener('click', () => {
  document.body.classList.remove('gradient-theme', 'gray-gradient');
  document.body.classList.add('rainbow-gradient');
  localStorage.setItem('gradient', 'rainbow');
  themeModal.style.display = 'none';
});

// Сохранение выбранного градиента
document.addEventListener('DOMContentLoaded', () => {
  const gradient = localStorage.getItem('gradient');
  if (gradient) {
    document.body.classList.add(gradient + '-gradient');
  }
});

// Динамическое добавление букв "A R T E M O S K A"
const textContainer = document.getElementById('text-container');
const text = 'A R T E M O S K A';
const letters = text.split('');

letters.forEach((letter, index) => {
  const letterElement = document.createElement('span');
  letterElement.textContent = letter;
  letterElement.classList.add('letter');
  letterElement.style.animationDelay = `${index * 0.2}s`;
  textContainer.appendChild(letterElement);
});
