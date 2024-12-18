// Получаем элемент "Обо мне"
const aboutSection = document.querySelector('.about-section');

// Функция для проверки, достиг ли пользователь нижней части страницы
function checkScrollEnd() {
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 100) { // Увеличиваем погрешность до 100px
    aboutSection.classList.add('visible');
  }
}

// Следим за прокруткой страницы
window.addEventListener('scroll', checkScrollEnd);

// Проверка при первоначальной загрузке страницы
checkScrollEnd();
