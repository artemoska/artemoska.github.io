class TelegramAuth {
    constructor() {
        this.API_URL = 'https://artemoska.pythonanywhere.com';
    }
    
    async startAuth() {
        const userId = 'user_' + Date.now();
        
        try {
            const response = await fetch(`${this.API_URL}/generate_code?user_id=${userId}`);
            const data = await response.json();
            
            if (data.success) {
                // Показываем код пользователю
                this.showModal(data.code, data.expires_in, userId);
                
                // Начинаем проверку
                this.checkAuth(userId);
            }
        } catch (error) {
            alert('Ошибка API: ' + error.message);
        }
    }
    
    showModal(code, expiresIn, userId) {
        const modal = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;">
            <div style="background:white;padding:30px;border-radius:10px;max-width:500px;margin:100px auto;">
                <h2>Telegram Auth</h2>
                <div style="font-size:32px;font-weight:bold;text-align:center;">${code}</div>
                <p>Отправь боту: <code>/auth ${code}</code></p>
                <button onclick="navigator.clipboard.writeText('/auth ${code}')">📋 Копировать</button>
                <button onclick="window.open('https://t.me/artemoska_auth_bot')">🔗 Открыть Telegram</button>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }
    
    async checkAuth(userId) {
        const check = await fetch(`${this.API_URL}/check_auth/${userId}`);
        const data = await check.json();
        
        if (data.authenticated) {
            alert('✅ Авторизация успешна!');
            // Закрыть модалку и обновить UI
        } else {
            // Повторить через 2 секунды
            setTimeout(() => this.checkAuth(userId), 2000);
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.telegramAuth = new TelegramAuth();
});
