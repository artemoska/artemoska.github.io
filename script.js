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
  const savedGradient = localStorage.getItem('gradient');
  if (savedGradient) {
    document.body.classList.add(
      savedGradient === 'gray' ? 'gray-gradient' :
      savedGradient === 'rainbow' ? 'rainbow-gradient' : 'gradient-theme'
    );
  }
});

// Буквы A R T E M O S K A
const text = 'A R T E M O S K A';
const container = document.getElementById('text-container');

let index = 0;
const interval = setInterval(() => {
  if (index < text.length) {
    const letter = document.createElement('span');
    letter.textContent = text[index];
    letter.classList.add('letter');
    container.appendChild(letter);
    index++;
  } else {
    clearInterval(interval);
  }
}, 300);
