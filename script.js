// Получаем элемент "Обо мне"
const aboutSection = document.querySelector('.about-section');

// Функция для проверки, достиг ли пользователь нижней части страницы
function checkScrollEnd() {
  // Получаем высоту документа и положение прокрутки
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;

  // Проверяем, если прокрутка достигла или чуть превысила нижнюю часть страницы
  if (scrollPosition >= pageHeight - 10) {
    aboutSection.classList.add('visible');
  }
}

// Следим за прокруткой страницы
window.addEventListener('scroll', checkScrollEnd);

// Проверяем при первоначальной загрузке, чтобы убедиться, что блок скрыт в начале
checkScrollEnd();
