// auth-fix.js - Исправление авторизации для консоли
(function() {
    console.log('🔧 Загружен фикс авторизации для консоли');
    
    // Автоматическая синхронизация при загрузке
    setTimeout(() => {
        const newUser = JSON.parse(localStorage.getItem('currentUser'));
        const oldUser = JSON.parse(localStorage.getItem('artemoska_user'));
        
        if (newUser && !oldUser) {
            console.log('🔄 Автоматическая синхронизация для консоли...');
            
            // Создаем совместимого пользователя
            const compatibleUser = {
                id: newUser.id || Date.now(),
                firstName: newUser.profile?.name || newUser.email.split('@')[0],
                lastName: '',
                username: newUser.email.split('@')[0],
                email: newUser.email,
                authDate: Date.now(),
                isNewSystem: true
            };
            
            localStorage.setItem('artemoska_user', JSON.stringify(compatibleUser));
            
            // Создаем начальные достижения
            if (!localStorage.getItem('artemoska_achievements')) {
                localStorage.setItem('artemoska_achievements', JSON.stringify(['welcome']));
            }
            
            // Создаем ARG прогресс
            if (!localStorage.getItem('artemoska_arg')) {
                localStorage.setItem('artemoska_arg', '0');
            }
            
            console.log('✅ Консоль готова к работе с новой системой авторизации');
        }
    }, 1000);
})();
