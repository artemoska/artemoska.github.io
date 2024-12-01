// Получаем кнопку и музыку
const playButton = document.getElementById('playButton');
const audio = document.getElementById('music');
const animatedTexts = document.querySelectorAll('.animated-text');

// Обработчик нажатия кнопки "Play"
playButton.addEventListener('click', function() {
    // Воспроизведение музыки
    audio.play().then(() => {
        console.log('Музыка начала воспроизведение!');
    }).catch(error => {
        console.error('Ошибка воспроизведения музыки:', error);
    });

    // Начинаем анимацию через 14 секунд после нажатия кнопки
    setTimeout(() => {
        let currentIndex = 0;

        // Функция для добавления класса "played" к каждой строке
        function playTextAnimation() {
            if (currentIndex < animatedTexts.length) {
                // Добавляем класс для показа
                animatedTexts[currentIndex].classList.add('played');
                
                // Через 3 секунды строка начнёт уезжать влево
                setTimeout(() => {
                    animatedTexts[currentIndex].classList.add('played-out');
                }, 3000); // Через 3 секунды она уедет влево

                // Переход к следующей строке
                currentIndex++;

                // Плавно переходим к следующей строке каждые 6 секунд (3 для появления + 3 для уезда)
                setTimeout(playTextAnimation, 6000);
            }
        }

        // Запускаем анимацию текста
        playTextAnimation();
    }, 14000); // Задержка перед началом анимации
});
