// Песенные строки
const lines = [
    "Я вампир, какая твоя группа крови?",
    "Дай мне укусить, я клянусь, не будет больно",
    "Приходи ко мне, я не хочу быть одиноким",
    "Нож в моих руках поможет мне чертить дороги",
    "Детка, я вампир",
];

// Ссылки на элементы
const container = document.getElementById('text-container');
const playButton = document.getElementById('play-button');
const audio = document.getElementById('audio');

// Добавление текста под бит
let lineIndex = 0;
let textInterval;

const playTextAnimation = () => {
    // Первая строка через 13 секунд
    setTimeout(() => {
        displayLine();
        // Следующие строки каждые 3 секунды
        textInterval = setInterval(displayLine, 3000);
    }, 13000); // Задержка перед первой строкой
};

// Функция для отображения строки
const displayLine = () => {
    container.innerHTML = ''; // Очистка предыдущей строки
    const textElement = document.createElement('div');
    textElement.textContent = lines[lineIndex];
    textElement.className = 'text-line';
    container.appendChild(textElement);

    lineIndex = (lineIndex + 1) % lines.length; // Цикл строк
};

// Управление воспроизведением
playButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playButton.textContent = '⏸️ Пауза';
        playTextAnimation();
    } else {
        audio.pause();
        playButton.textContent = '▶️ Воспроизвести';
        clearInterval(textInterval);
    }
});
