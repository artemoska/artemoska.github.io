// Получаем кнопку и музыку
const playButton = document.getElementById('playButton');
const audio = document.getElementById('music');
const animatedTexts = document.querySelectorAll('.animated-text');

// Обработчик нажатия кнопки "Play"
playButton.addEventListener('click', function() {
    // Воспроизводим музыку
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
                animatedTexts[currentIndex].classList.add('played');
                currentIndex++;

                // Плавно переходим к следующей строке каждые 3 секунды
                setTimeout(playTextAnimation, 3000);
            }
        }

        // Запускаем анимацию текста
        playTextAnimation();
    }, 14000); // Задержка перед началом анимации
});
