class TelegramAuth {
    constructor() {
        this.API_URL = 'https://artemoska.pythonanywhere.com';
        this.userId = this.generateUserId();
        this.checkInterval = null;
    }
    
    generateUserId() {
        // Генерируем уникальный ID
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    async startAuth() {
        try {
            // 1. Получаем код с сервера
            const response = await fetch(`${this.API_URL}/generate_code?user_id=${this.userId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Ошибка генерации кода');
            }
            
            // 2. Показываем код пользователю
            this.showAuthModal(data.code, data.expires_in);
            
            // 3. Начинаем проверку статуса
            this.startChecking();
            
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            alert('Ошибка подключения к серверу. Проверьте консоль.');
        }
    }
    
    showAuthModal(code, expiresIn) {
        const modalHTML = `
        <div id="tgAuthModal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
            justify-content: center; z-index: 10000; font-family: Arial;
        ">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
                <h2 style="color: #0088cc; margin-bottom: 20px;">
                    <i class="fab fa-telegram"></i> Telegram Auth
                </h2>
                
                <div style="background: linear-gradient(135deg, #0088cc, #24A1DE); 
                    color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                        ${code}
                    </div>
                    <div style="margin-top: 10px;">
                        Код действует: <span id="authTimer">05:00</span>
                    </div>
                </div>
                
                <h3>📱 Инструкция:</h3>
                <ol style="line-height: 1.8;">
                    <li>Откройте <strong>Telegram</strong></li>
                    <li>Найдите бота <strong>@artemoska_auth_bot</strong></li>
                    <li>Отправьте команду:</li>
                </ol>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; 
                    margin: 15px 0; font-family: monospace; font-size: 18px;">
                    /auth ${code}
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="copyCode('${code}')" style="
                        flex: 1; padding: 12px; background: #6366f1; 
                        color: white; border: none; border-radius: 5px; cursor: pointer;">
                        📋 Копировать
                    </button>
                    <button onclick="openTelegram()" style="
                        flex: 1; padding: 12px; background: #0088cc; 
                        color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔗 Открыть Telegram
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.telegramAuth.closeModal()" style="
                        background: none; border: none; color: #666; cursor: pointer;">
                        ❌ Отмена
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Таймер
        let timeLeft = expiresIn;
        const timerEl = document.getElementById('authTimer');
        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.closeModal();
                alert('Время действия кода истекло!');
                return;
            }
            const min = Math.floor(timeLeft / 60);
            const sec = timeLeft % 60;
            timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }, 1000);
        
        // Глобальные функции для кнопок
        window.copyCode = function(code) {
            navigator.clipboard.writeText(`/auth ${code}`);
            alert('✅ Код скопирован!');
        };
        
        window.openTelegram = function() {
            window.open('https://t.me/artemoska_auth_bot', '_blank');
        };
    }
    
    startChecking() {
        // Проверяем каждые 2 секунды
        this.checkInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.API_URL}/check_auth/${this.userId}`);
                const data = await response.json();
                
                if (data.authenticated) {
                    this.handleSuccess(data.user);
                }
            } catch (error) {
                console.error('Ошибка проверки:', error);
            }
        }, 2000);
    }
    
    handleSuccess(userData) {
        clearInterval(this.checkInterval);
        this.closeModal();
        
        // Сохраняем данные
        localStorage.setItem('tg_auth', JSON.stringify({
            user: userData,
            timestamp: Date.now()
        }));
        
        // Обновляем UI
        this.updateUI(userData);
        
        alert(`✅ Авторизация успешна! Привет, ${userData.first_name || 'друг'}!`);
    }
    
    updateUI(userData) {
        // Обновляем интерфейс сайта
        const loginBtn = document.getElementById('loginBtn');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userAvatar) userAvatar.innerHTML = `<i class="fab fa-telegram"></i>`;
        if (userName) userName.textContent = userData.first_name || 'Telegram User';
    }
    
    closeModal() {
        const modal = document.getElementById('tgAuthModal');
        if (modal) modal.remove();
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    
    logout() {
        localStorage.removeItem('tg_auth');
        location.reload();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.telegramAuth = new TelegramAuth();
    
    // Проверяем существующую авторизацию
    const savedAuth = localStorage.getItem('tg_auth');
    if (savedAuth) {
        try {
            const authData = JSON.parse(savedAuth);
            if (Date.now() - authData.timestamp < 86400000) { // 24 часа
                window.telegramAuth.updateUI(authData.user);
            } else {
                localStorage.removeItem('tg_auth');
            }
        } catch (e) {
            localStorage.removeItem('tg_auth');
        }
    }
});
