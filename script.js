// Проверка прокрутки страницы для изменения стиля
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    document.body.classList.add('black-white-mode');  // Добавляем черно-белый стиль
  } else {
    document.body.classList.remove('black-white-mode');  // Убираем черно-белый стиль
  }
});
