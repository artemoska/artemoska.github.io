const API_URL = 'https://artemoska.pythonanywhere.com';

async function startTelegramAuth() {
    try {
        // Генерируем уникальный ID
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Получаем код
        const response = await fetch(`${API_URL}/generate_code?user_id=${userId}`);
        const data = await response.json();
        
        if (!data.success) {
            alert('Ошибка генерации кода');
            return;
        }
        
        // Показываем код
        showAuthModal(data.code, userId);
        
        // Начинаем проверку
        checkAuthLoop(userId);
        
    } catch (error) {
        alert('Ошибка подключения к серверу');
        console.error(error);
    }
}

function showAuthModal(code, userId) {
    const modal = `
    <div id="tgModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;">
        <div style="background:white;padding:30px;border-radius:10px;max-width:500px;margin:100px auto;">
            <h2>🔐 Telegram Auth</h2>
            <div style="font-size:32px;font-weight:bold;text-align:center;margin:20px 0;">${code}</div>
            <p>Отправьте боту:</p>
            <div style="background:#f8f9fa;padding:10px;border-radius:5px;margin:10px 0;">
                <code>/auth ${code}</code>
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="copyCode('${code}')" style="flex:1;padding:10px;background:#0088cc;color:white;border:none;border-radius:5px;">
                    📋 Копировать
                </button>
                <button onclick="openTelegram()" style="flex:1;padding:10px;background:#6366f1;color:white;border:none;border-radius:5px;">
                    🔗 Открыть Telegram
                </button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Глобальные функции для кнопок
    window.copyCode = (code) => {
        navigator.clipboard.writeText(`/auth ${code}`);
        alert('✅ Код скопирован!');
    };
    
    window.openTelegram = () => {
        window.open('https://t.me/artemoska_auth_bot', '_blank');
    };
}

async function checkAuthLoop(userId) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/check_auth/${userId}`);
            const data = await response.json();
            
            if (data.authenticated) {
                clearInterval(interval);
                closeModal();
                
                // Сохраняем данные
                localStorage.setItem('tg_auth', JSON.stringify({
                    user: data.user,
                    timestamp: Date.now()
                }));
                
                // Обновляем UI
                updateUserUI(data.user);
                alert(`✅ Авторизация успешна! Привет, ${data.user.first_name}!`);
            }
        } catch (error) {
            console.error('Ошибка проверки:', error);
        }
    }, 2000);
    
    // Остановить через 5 минут
    setTimeout(() => {
        clearInterval(interval);
        closeModal();
        alert('⏱️ Время действия кода истекло');
    }, 300000);
}

function closeModal() {
    const modal = document.getElementById('tgModal');
    if (modal) modal.remove();
}

function updateUserUI(userData) {
    // Обновите ваш UI здесь
    console.log('Пользователь авторизован:', userData);
}
