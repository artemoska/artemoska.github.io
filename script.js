document.getElementById('playButton').addEventListener('click', function() {
    var audio = document.getElementById('music');
    
    // Запуск воспроизведения музыки при нажатии кнопки
    audio.play().then(function() {
        console.log('Музыка начала воспроизводиться!');
    }).catch(function(error) {
        console.log('Ошибка воспроизведения музыки:', error);
    });

    // Начинаем анимацию текста через 14 секунд
    setTimeout(function() {
        let texts = document.querySelectorAll('.animated-text');
        let currentText = 0;

        // Функция для запуска анимации каждой строки
        function animateText() {
            if (currentText < texts.length) {
                texts[currentText].style.animation = 'gradientAnimation 3s ease infinite, slideIn 3s ease forwards';
                texts[currentText].style.opacity = 1; // Делаем текст видимым
                currentText++;

                // Плавно исчезает и появляется следующая строка через 3 секунды
                setTimeout(animateText, 3000);
            }
        }

        animateText(); // Запуск анимации
    }, 14000); // Задержка перед анимацией
});
