// Проверка прокрутки страницы для изменения темы
window.addEventListener('scroll', () => {
  // Проверяем, если пользователь прокрутил страницу более чем на 100 пикселей
  if (window.scrollY > 100) {
    document.body.classList.add('black-white-mode');  // Добавляем черно-белый стиль
  } else {
    document.body.classList.remove('black-white-mode');  // Убираем черно-белый стиль
  }
});
