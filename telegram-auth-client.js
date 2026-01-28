// Telegram авторизация для GitHub Pages
class TelegramAuthClient {
    constructor() {
        this.API_URL = 'https://ваш-бот.herokuapp.com'; // Или PythonAnywhere
        this.userId = this.getOrCreateUserId();
        this.authInterval = null;
    }
    
    // Получаем или создаем ID пользователя
    getOrCreateUserId() {
        let userId = localStorage.getItem('tg_user_id');
        
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tg_user_id', userId);
        }
        
        return userId;
    }
    
    // Генерация кода через API
    async generateAuthCode() {
        try {
            const response = await fetch(`${this.API_URL}/generate_code/${this.userId}`);
            const data = await response.json();
            
            return {
                code: data.code,
                expiresIn: data.expires
            };
        } catch (error) {
            console.error('Ошибка генерации кода:', error);
            return null;
        }
    }
    
    // Проверка статуса авторизации
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.API_URL}/check_auth/${this.userId}`);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Ошибка проверки статуса:', error);
            return { authenticated: false };
        }
    }
    
    // Запуск процесса авторизации
    async startTelegramAuth() {
        // Генерируем код
        const codeData = await this.generateAuthCode();
        
        if (!codeData) {
            alert('Ошибка соединения с сервером');
            return;
        }
        
        // Показываем модальное окно
        this.showAuthModal(codeData.code, codeData.expiresIn);
        
        // Начинаем проверку статуса
        this.startPolling();
    }
    
    // Показ модального окна
    showAuthModal(code, expiresIn) {
        // Удаляем старое модальное окно если есть
        const oldModal = document.getElementById('telegramAuthModal');
        if (oldModal) oldModal.remove();
        
        const modalHTML = `
        <div id="telegramAuthModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                padding: 2.5rem;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            ">
                <h2 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fab fa-telegram"></i> Telegram Auth
                </h2>
                
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 1.5rem;
                ">
                    <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 5px;">
                        ${code}
                    </div>
                    <div style="margin-top: 0.5rem; opacity: 0.9;">
                        Код действителен: <span id="timer">05:00</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">📱 Инструкция:</h4>
                    <ol style="margin-left: 1.5rem; line-height: 1.6;">
                        <li>Открой <strong>Telegram</strong></li>
                        <li>Найди бота <strong>@artemoska_auth_bot</strong></li>
                        <li>Отправь команду:</li>
                    </ol>
                    <div style="
                        background: #f3f4f6;
                        padding: 1rem;
                        border-radius: 8px;
                        margin-top: 0.5rem;
                        font-family: 'Fira Code', monospace;
                    ">
                        /auth ${code}
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                ">
                    <button onclick="window.telegramAuth.copyCode('${code}')" 
                        style="
                            flex: 1;
                            padding: 0.8rem;
                            background: var(--primary);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                        <i class="fas fa-copy"></i> Копировать
                    </button>
                    <button onclick="window.telegramAuth.openTelegram()"
                        style="
                            flex: 1;
                            padding: 0.8rem;
                            background: #0088cc;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                        <i class="fab fa-telegram"></i> Открыть Telegram
                    </button>
                </div>
                
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button onclick="window.telegramAuth.closeModal()"
                        style="
                            background: none;
                            border: none;
                            color: var(--text-light);
                            cursor: pointer;
                            font-size: 0.9rem;
                        ">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.startTimer(expiresIn);
    }
    
    // Таймер обратного отсчета
    startTimer(seconds) {
        let timeLeft = seconds;
        const timerElement = document.getElementById('timer');
        
        if (!timerElement) return;
        
        const interval = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                this.closeModal();
                alert('Время действия кода истекло!');
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // Опрос статуса авторизации
    startPolling() {
        // Останавливаем предыдущий интервал
        if (this.authInterval) clearInterval(this.authInterval);
        
        this.authInterval = setInterval(async () => {
            const status = await this.checkAuthStatus();
            
            if (status.authenticated) {
                // Авторизация успешна
                clearInterval(this.authInterval);
                this.handleSuccessfulAuth(status);
            }
        }, 2000); // Проверяем каждые 2 секунды
    }
    
    // Обработка успешной авторизации
    handleSuccessfulAuth(userData) {
        // Сохраняем данные пользователя
        localStorage.setItem('tg_auth_data', JSON.stringify(userData));
        
        // Закрываем модальное окно
        this.closeModal();
        
        // Обновляем UI
        this.updateUserInterface(userData);
        
        // Показываем уведомление
        this.showNotification(`✅ Авторизация через Telegram успешна! Привет, ${userData.first_name}!`);
    }
    
    // Копирование кода в буфер обмена
    copyCode(code) {
        navigator.clipboard.writeText(`/auth ${code}`).then(() => {
            this.showNotification('📋 Код скопирован в буфер обмена!');
        });
    }
    
    // Открытие Telegram
    openTelegram() {
        window.open('https://t.me/artemoska_auth_bot', '_blank');
    }
    
    // Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('telegramAuthModal');
        if (modal) modal.remove();
        
        if (this.authInterval) {
            clearInterval(this.authInterval);
            this.authInterval = null;
        }
    }
    
    // Выход из системы
    logout() {
        localStorage.removeItem('tg_auth_data');
        localStorage.removeItem('tg_user_id');
        
        // Обновляем UI
        this.updateUserInterface(null);
        
        this.showNotification('👋 Вы вышли из системы');
    }
    
    // Проверка авторизации при загрузке
    async checkOnLoad() {
        const authData = JSON.parse(localStorage.getItem('tg_auth_data') || 'null');
        
        if (authData) {
            // Проверяем актуальность на сервере
            const currentStatus = await this.checkAuthStatus();
            
            if (currentStatus.authenticated) {
                this.updateUserInterface(currentStatus);
                return true;
            } else {
                // Сессия устарела
                localStorage.removeItem('tg_auth_data');
            }
        }
        
        return false;
    }
    
    // Обновление интерфейса
    updateUserInterface(userData) {
        const loginBtn = document.getElementById('loginBtn');
        const profileHeader = document.getElementById('profileHeader');
        
        if (!loginBtn || !profileHeader) return;
        
        if (userData) {
            // Пользователь авторизован
            loginBtn.style.display = 'none';
            profileHeader.style.display = 'flex';
            
            // Обновляем данные профиля
            const userNameEl = document.getElementById('userName');
            const userAvatar = document.getElementById('userAvatar');
            
            if (userNameEl) {
                userNameEl.textContent = userData.first_name || 'Telegram User';
            }
            
            if (userAvatar) {
                userAvatar.innerHTML = `<i class="fab fa-telegram"></i>`;
                userAvatar.title = `@${userData.username || 'user'}`;
            }
            
            // Обновляем приветствие
            const greeting = document.getElementById('greeting');
            if (greeting) {
                greeting.textContent = `Привет, ${userData.first_name}!`;
            }
        } else {
            // Пользователь не авторизован
            loginBtn.style.display = 'flex';
            profileHeader.style.display = 'none';
        }
    }
    
    // Уведомление
    showNotification(message) {
        // Простая реализация уведомления
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.telegramAuth = new TelegramAuthClient();
    
    // Проверяем авторизацию при загрузке
    window.telegramAuth.checkOnLoad();
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
