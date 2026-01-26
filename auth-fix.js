// auth-fix.js - Унифицированная система авторизации
console.log('🔧 Загружен auth-fix.js');

// Единый объект пользователя для всех систем
class UnifiedAuthSystem {
    constructor() {
        this.currentUser = null;
        this.userData = {};
        this.init();
    }
    
    init() {
        console.log('🔄 Инициализация унифицированной системы...');
        this.migrateOldData();
        this.loadCurrentUser();
        this.setupEventListeners();
    }
    
    // Миграция данных со старой системы
    migrateOldData() {
        // Проверяем старую систему (Telegram)
        const oldUser = localStorage.getItem('artemoska_user');
        if (oldUser) {
            try {
                const parsed = JSON.parse(oldUser);
                console.log('📦 Найдены данные старой системы:', parsed);
                
                // Преобразуем в новый формат
                const newUser = {
                    id: parsed.id || `user_${Date.now()}`,
                    email: parsed.email || `${parsed.username}@telegram.com`,
                    authMethod: 'telegram',
                    telegramData: parsed,
                    profile: {
                        name: parsed.firstName || parsed.username || 'Пользователь',
                        avatar: parsed.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.firstName || 'User')}&background=6366f1&color=fff`
                    },
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                // Сохраняем
                localStorage.setItem(`user_${newUser.email}`, JSON.stringify(newUser));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                
                // Удаляем старые данные
                localStorage.removeItem('artemoska_user');
                console.log('✅ Данные мигрированы в новую систему');
                
            } catch (e) {
                console.error('❌ Ошибка миграции:', e);
            }
        }
    }
    
    // Загружаем текущего пользователя
    loadCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            try {
                this.currentUser = JSON.parse(userJson);
                console.log('👤 Пользователь загружен:', this.currentUser.email);
                
                // Загружаем прогресс пользователя
                this.loadUserProgress(this.currentUser.email);
                
                // Обновляем UI
                this.updateUI();
                
            } catch (e) {
                console.error('❌ Ошибка загрузки пользователя:', e);
                localStorage.removeItem('currentUser');
            }
        } else {
            console.log('👤 Пользователь не авторизован');
        }
    }
    
    // Загружаем прогресс пользователя
    loadUserProgress(email) {
        const key = `user_progress_${email}`;
        const progress = localStorage.getItem(key);
        
        if (progress) {
            this.userData[email] = JSON.parse(progress);
            console.log('📊 Прогресс загружен для', email);
        } else {
            // Создаем новый прогресс
            this.userData[email] = {
                achievements: ['welcome'],
                inventory: [],
                argProgress: 1,
                level: 1,
                secretUnlocked: false,
                lastActive: new Date().toISOString()
            };
            this.saveUserProgress(email);
        }
    }
    
    // Сохраняем прогресс пользователя
    saveUserProgress(email) {
        const key = `user_progress_${email}`;
        localStorage.setItem(key, JSON.stringify(this.userData[email]));
        console.log('💾 Прогресс сохранен для', email);
    }
    
    // Получаем текущий прогресс
    getCurrentProgress() {
        if (!this.currentUser) return null;
        return this.userData[this.currentUser.email];
    }
    
    // Обновляем UI
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileHeader = document.getElementById('profileHeader');
        const greeting = document.getElementById('greeting');
        const userNameEl = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (!loginBtn || !profileHeader || !greeting || !userNameEl || !userAvatar) {
            console.log('⏳ UI элементы еще не загружены');
            return;
        }
        
        if (this.currentUser) {
            // Пользователь авторизован
            loginBtn.style.display = 'none';
            profileHeader.style.display = 'flex';
            
            const userName = this.currentUser.profile?.name || 
                           this.currentUser.email.split('@')[0];
            
            userNameEl.textContent = userName;
            greeting.textContent = `Привет, ${userName}!`;
            
            // Устанавливаем аватар
            if (this.currentUser.profile?.avatar) {
                userAvatar.innerHTML = `<img src="${this.currentUser.profile.avatar}" 
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                    onerror="this.parentElement.innerHTML='👤'">`;
            } else {
                userAvatar.innerHTML = userName.charAt(0).toUpperCase();
            }
            
            console.log('✅ UI обновлен для пользователя:', userName);
            
        } else {
            // Пользователь не авторизован
            loginBtn.style.display = 'inline-flex';
            profileHeader.style.display = 'none';
            greeting.textContent = 'Привет, я Artemoska!';
            userNameEl.textContent = '';
            userAvatar.innerHTML = '👤';
        }
    }
    
    // Показываем секретный контент
    showSecretContent() {
        if (!this.currentUser) return;
        
        const secretSection = document.querySelector('.secret-section');
        const secretContent = document.getElementById('secretContent');
        const secretProject = document.getElementById('secretProject');
        
        if (secretSection) secretSection.classList.add('active');
        if (secretContent) secretContent.style.display = 'block';
        if (secretProject) secretProject.style.display = 'block';
        
        // Загружаем ачивки
        this.loadAchievements();
        
        console.log('🔓 Секретный контент показан');
    }
    
    // Загружаем ачивки
    loadAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid || !this.currentUser) return;
        
        const progress = this.getCurrentProgress();
        if (!progress) return;
        
        grid.innerHTML = '';
        
        const allAchievements = [
            { code: 'welcome', name: '👋 Добро пожаловать', desc: 'Первый вход в систему', icon: '👋' },
            { code: 'console_master', name: '🎮 Мастер консоли', desc: 'Использовать 10 команд', icon: '🎮' },
            { code: 'secret_finder', name: '🔍 Искатель секретов', desc: 'Найти скрытую команду', icon: '🔍' },
            { code: 'hacker', name: '💻 Хакер', desc: 'Взломать систему', icon: '💻' },
            { code: 'project_unlocker', name: '🧪 Открыватель', desc: 'Разблокировать секретный проект', icon: '🧪' },
            { code: 'arg_starter', name: '🕵️‍♂️ ARG начало', desc: 'Начать ARG квест', icon: '🕵️‍♂️' },
            { code: 'arg_completer', name: '🏆 Мастер ARG', desc: 'Завершить ARG квест', icon: '🏆' },
            { code: 'time_traveler', name: '⏱️ Путешественник', desc: 'Провести 1 час на сайте', icon: '⏱️' }
        ];
        
        allAchievements.forEach(ach => {
            const unlocked = progress.achievements.includes(ach.code);
            
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? '' : 'achievement-locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <h4 style="margin-bottom: 0.5rem;">${ach.name}</h4>
                <p style="font-size: 0.8rem; color: var(--text-light);">${ach.desc}</p>
                <div style="margin-top: 0.5rem; font-size: 0.7rem;">
                    ${unlocked ? '✅ Получено' : '🔒 Заблокировано'}
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    // Разблокируем ачивку
    unlockAchievement(code) {
        if (!this.currentUser) return false;
        
        const progress = this.getCurrentProgress();
        if (!progress.achievements.includes(code)) {
            progress.achievements.push(code);
            this.saveUserProgress(this.currentUser.email);
            
            // Показываем уведомление
            this.showNotification(`🏆 Ачивка получена!`);
            
            // Обновляем отображение
            this.loadAchievements();
            
            console.log(`🎉 Ачивка "${code}" разблокирована`);
            return true;
        }
        return false;
    }
    
    // Вход через email (новая система)
    loginWithEmail(userData) {
        if (!userData || !userData.email) {
            console.error('❌ Нет данных для входа');
            return false;
        }
        
        console.log('📧 Вход через email:', userData.email);
        
        // Загружаем или создаем пользователя
        let user = JSON.parse(localStorage.getItem(`user_${userData.email}`));
        
        if (!user) {
            // Создаем нового пользователя
            user = {
                id: `user_${Date.now()}`,
                email: userData.email,
                authMethod: 'email',
                profile: {
                    name: userData.email.split('@')[0],
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email.split('@')[0])}&background=6366f1&color=fff`
                },
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
        } else {
            // Обновляем последний вход
            user.lastLogin = new Date().toISOString();
        }
        
        // Сохраняем пользователя
        localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Устанавливаем текущего пользователя
        this.currentUser = user;
        
        // Загружаем прогресс
        this.loadUserProgress(user.email);
        
        // Разблокируем начальную ачивку
        this.unlockAchievement('welcome');
        
        // Обновляем UI
        this.updateUI();
        
        // Показываем секретный контент
        this.showSecretContent();
        
        console.log('✅ Вход выполнен:', user.email);
        this.showNotification(`Добро пожаловать, ${user.profile.name}!`);
        
        return true;
    }
    
    // Выход из системы
    logout() {
        if (!this.currentUser) return;
        
        if (confirm('Выйти из аккаунта?')) {
            const email = this.currentUser.email;
            
            // Сохраняем прогресс перед выходом
            if (this.userData[email]) {
                this.userData[email].lastActive = new Date().toISOString();
                this.saveUserProgress(email);
            }
            
            // Очищаем текущую сессию
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            
            // Обновляем UI
            this.updateUI();
            
            console.log('👋 Пользователь вышел из системы');
            this.showNotification('Вы вышли из системы');
            
            // Перезагружаем страницу
            setTimeout(() => window.location.reload(), 1000);
        }
    }
    
    // Показываем уведомление
    showNotification(message) {
        // Простая реализация уведомления
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `<i class="fas fa-bell" style="margin-right: 10px;"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Настраиваем обработчики событий
    setupEventListeners() {
        // Обработчик выхода
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Обработчик входа
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'register.html';
            });
        }
    }
}

// Создаем глобальный экземпляр системы авторизации
window.AuthSystem = new UnifiedAuthSystem();

// Экспортируем функции для глобального использования
window.logout = function() {
    window.AuthSystem.logout();
};

window.unlockAchievement = function(code) {
    return window.AuthSystem.unlockAchievement(code);
};

window.getCurrentProgress = function() {
    return window.AuthSystem.getCurrentProgress();
};

// Добавляем стили для уведомлений
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

console.log('✅ Система авторизации готова');
