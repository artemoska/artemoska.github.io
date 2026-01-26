// Система регистрации - ТОЛЬКО отправка на email
document.addEventListener('DOMContentLoaded', function() {
    console.log('Система регистрации загружена');
    
    // Инициализация EmailJS
    try {
        emailjs.init("dqDwAfC5HAi1bp0q3");
        console.log('EmailJS инициализирован');
    } catch (error) {
        console.error('Ошибка EmailJS:', error);
        showError('regEmailError', 'Ошибка инициализации email сервиса. Попробуйте позже.');
    }
    
    initEventHandlers();
});

// Глобальные переменные
let currentEmail = '';
let resendTimer = null;

// Инициализация обработчиков
function initEventHandlers() {
    // Автопереход между полями кода
    const codeInputs = document.querySelectorAll('.code-input');
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
}

// Валидация email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Показать сообщение об ошибке
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 5000);
    }
}

// Показать сообщение об успехе
function showSuccess(message, duration = 5000) {
    const successEl = document.getElementById('successMessage');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        successEl.style.color = '#10b981';
        successEl.style.backgroundColor = '#f0fff4';
        successEl.style.padding = '15px';
        successEl.style.borderRadius = '10px';
        successEl.style.marginTop = '20px';
        successEl.style.border = '1px solid #10b981';
        
        setTimeout(() => successEl.style.display = 'none', duration);
    }
}

// Основная функция отправки кода
async function sendVerificationCode() {
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    
    // Валидация
    if (!email || !validateEmail(email)) {
        showError('regEmailError', 'Введите корректный email адрес');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('regPasswordError', 'Пароль должен быть не менее 6 символов');
        return;
    }
    
    if (!confirmPassword || password !== confirmPassword) {
        showError('regConfirmPasswordError', 'Пароли не совпадают');
        return;
    }
    
    // Проверяем, не зарегистрирован ли email
    if (localStorage.getItem(`user_${email.toLowerCase()}`)) {
        showError('regEmailError', 'Пользователь с таким email уже зарегистрирован');
        return;
    }
    
    // Блокируем кнопку
    const sendBtn = document.getElementById('sendCodeBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка кода на email...';
    sendBtn.disabled = true;
    
    try {
        // Генерируем код
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        currentEmail = email.toLowerCase();
        
        console.log(`Генерируем код ${verificationCode} для ${currentEmail}`);
        
        // Отправляем email через EmailJS
        const emailResult = await emailjs.send(
            'artemoska', // Service ID
            'template_8kpkiyr', // Template ID
            {
                to_email: currentEmail,
                code: verificationCode,
                subject: 'Код подтверждения регистрации | Artemoska',
                message: `Ваш код подтверждения: ${verificationCode}\n\nВведите этот код на странице регистрации для завершения процесса.`
            }
        );
        
        console.log('EmailJS результат:', emailResult);
        
        if (emailResult.status === 200) {
            // Сохраняем данные для проверки
            localStorage.setItem(`pending_${currentEmail}`, JSON.stringify({
                code: verificationCode,
                password: btoa(password), // Простое "шифрование"
                timestamp: Date.now(),
                email: currentEmail
            }));
            
            // Сохраняем в sessionStorage для надежности
            sessionStorage.setItem('pending_email', currentEmail);
            sessionStorage.setItem('pending_code', verificationCode);
            
            // Показываем сообщение об успешной отправке
            showSuccess(`✅ Код подтверждения отправлен на ${currentEmail}\nПроверьте вашу почту (включая папку "Спам")`, 10000);
            
            // Переходим к подтверждению
            document.getElementById('emailDisplay').textContent = currentEmail;
            showStep('verify-register');
            startResendTimer();
            
            // Очищаем пароли
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
            
        } else {
            throw new Error(`Статус ответа: ${emailResult.status}`);
        }
        
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        
        // Показываем подробную ошибку
        let errorMessage = 'Не удалось отправить код на email. ';
        
        if (error.text && error.text.includes('Invalid login')) {
            errorMessage += 'Ошибка аутентификации EmailJS. Проверьте настройки.';
        } else if (error.text && error.text.includes('template')) {
            errorMessage += 'Ошибка шаблона EmailJS.';
        } else {
            errorMessage += `Причина: ${error.text || error.message}`;
        }
        
        errorMessage += '\n\nПроверьте:\n1. Правильность email\n2. Настройки EmailJS\n3. Соединение с интернетом';
        
        showError('regEmailError', errorMessage);
        
        // Показываем код в консоли для отладки
        if (verificationCode) {
            console.log(`Отладочная информация (НЕ показывать пользователю!):`);
            console.log(`Email: ${currentEmail}`);
            console.log(`Код: ${verificationCode}`);
            console.log(`Для тестирования можно использовать этот код, но в продакшене этого быть не должно!`);
        }
        
    } finally {
        // Восстанавливаем кнопку
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

// Таймер для повторной отправки
function startResendTimer() {
    clearInterval(resendTimer);
    
    const countdownElement = document.getElementById('countdown');
    const timerText = document.getElementById('timerText');
    const resendContainer = document.getElementById('resendContainer');
    
    if (!countdownElement || !timerText || !resendContainer) return;
    
    let timeLeft = 60;
    countdownElement.textContent = timeLeft;
    timerText.style.display = 'block';
    resendContainer.style.display = 'none';
    
    resendTimer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            timerText.style.display = 'none';
            resendContainer.style.display = 'block';
        }
    }, 1000);
}

// Повторная отправка кода
async function resendCode() {
    if (!currentEmail) {
        showError('verifyBtn', 'Ошибка: email не найден');
        return;
    }
    
    // Блокируем ссылку
    const resendLink = document.getElementById('resendLink');
    const originalHtml = resendLink.innerHTML;
    resendLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    
    try {
        // Генерируем новый код
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log(`Повторная отправка кода ${newCode} на ${currentEmail}`);
        
        // Отправляем email
        await emailjs.send(
            'artemoska',
            'template_8kpkiyr',
            {
                to_email: currentEmail,
                code: newCode,
                subject: 'Новый код подтверждения | Artemoska',
                message: `Ваш новый код подтверждения: ${newCode}\n\nСтарый код больше не действителен.`
            }
        );
        
        // Обновляем сохраненный код
        const pendingData = JSON.parse(localStorage.getItem(`pending_${currentEmail}`) || '{}');
        pendingData.code = newCode;
        pendingData.timestamp = Date.now();
        localStorage.setItem(`pending_${currentEmail}`, JSON.stringify(pendingData));
        
        // Обновляем sessionStorage
        sessionStorage.setItem('pending_code', newCode);
        
        // Показываем успех
        showSuccess('✅ Новый код отправлен на вашу почту');
        
        // Сбрасываем таймер
        startResendTimer();
        
        // Очищаем поля ввода кода
        document.querySelectorAll('.code-input').forEach(input => {
            input.value = '';
            input.style.borderColor = '#e5e7eb';
        });
        
        // Фокус на первое поле
        setTimeout(() => {
            const firstInput = document.getElementById('code1');
            if (firstInput) firstInput.focus();
        }, 100);
        
    } catch (error) {
        console.error('Ошибка повторной отправки:', error);
        showError('verifyBtn', 'Ошибка отправки. Попробуйте позже.');
        
        // Показываем код в консоли для отладки
        console.log(`Отладочная информация (НЕ показывать пользователю!):`);
        console.log(`Email: ${currentEmail}`);
        console.log(`Новый код: ${newCode}`);
        
    } finally {
        // Восстанавливаем ссылку
        setTimeout(() => {
            resendLink.innerHTML = originalHtml;
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
        }, 5000);
    }
}

// Подтверждение кода и создание аккаунта
async function verifyRegistrationCode() {
    // Собираем код из всех полей
    const codeInputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
    
    // Валидация
    if (enteredCode.length !== 6) {
        showError('verifyBtn', 'Введите все 6 цифр кода');
        
        // Подсвечиваем незаполненные поля
        codeInputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = '#ef4444';
            }
        });
        return;
    }
    
    // Проверяем email
    if (!currentEmail) {
        showError('verifyBtn', 'Сессия истекла. Начните регистрацию заново.');
        showStep('register');
        return;
    }
    
    // Получаем сохраненные данные
    const pendingData = JSON.parse(localStorage.getItem(`pending_${currentEmail}`) || '{}');
    
    if (!pendingData.code) {
        showError('verifyBtn', 'Код не найден. Запросите новый код.');
        return;
    }
    
    // Проверяем срок действия кода (15 минут)
    const codeAge = Date.now() - pendingData.timestamp;
    const maxAge = 15 * 60 * 1000; // 15 минут
    
    if (codeAge > maxAge) {
        showError('verifyBtn', 'Код устарел. Запросите новый.');
        localStorage.removeItem(`pending_${currentEmail}`);
        return;
    }
    
    // Проверяем код
    if (enteredCode !== pendingData.code) {
        showError('verifyBtn', 'Неверный код. Попробуйте еще раз.');
        
        // Подсвечиваем все поля красным
        codeInputs.forEach(input => {
            input.style.borderColor = '#ef4444';
        });
        return;
    }
    
    // Блокируем кнопку подтверждения
    const verifyBtn = document.getElementById('verifyBtn');
    const originalText = verifyBtn.innerHTML;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание аккаунта...';
    verifyBtn.disabled = true;
    
    try {
        // Создаем объект пользователя
        const user = {
            id: 'user_' + Date.now(),
            email: currentEmail,
            password: pendingData.password,
            verified: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
                name: currentEmail.split('@')[0],
                displayName: currentEmail.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmail.split('@')[0])}&background=6366f1&color=fff&bold=true&size=128`,
                bio: 'Новый пользователь Artemoska',
                joinDate: new Date().toISOString().split('T')[0]
            },
            settings: {
                theme: 'light',
                notifications: true,
                emailNotifications: true
            },
            stats: {
                logins: 1,
                lastActive: new Date().toISOString()
            }
        };
        
        // Сохраняем пользователя
        localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
        
        // Устанавливаем как текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('last_login', new Date().toISOString());
        
        // Удаляем временные данные
        localStorage.removeItem(`pending_${currentEmail}`);
        sessionStorage.removeItem('pending_email');
        sessionStorage.removeItem('pending_code');
        
        // Зеленый цвет для полей кода
        codeInputs.forEach(input => {
            input.style.borderColor = '#10b981';
            input.style.backgroundColor = '#f0fff4';
        });
        
        // Показываем успех
        showSuccess('🎉 Аккаунт успешно создан! Перенаправляем на главную страницу...', 3000);
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        verifyBtn.style.backgroundColor = '#10b981';
        
        // Перенаправляем через 3 секунды
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка создания аккаунта:', error);
        showError('verifyBtn', 'Ошибка создания аккаунта. Попробуйте еще раз.');
        
        // Восстанавливаем кнопку
        verifyBtn.innerHTML = originalText;
        verifyBtn.disabled = false;
    }
}

// Вход в систему
async function loginUser() {
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value;
    
    // Валидация
    if (!email || !validateEmail(email)) {
        showError('loginEmailError', 'Введите корректный email адрес');
        return;
    }
    
    if (!password) {
        showError('loginPasswordError', 'Введите пароль');
        return;
    }
    
    // Блокируем кнопку
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
    loginBtn.disabled = true;
    
    try {
        // Ищем пользователя
        const userData = localStorage.getItem(`user_${email}`);
        if (!userData) {
            throw new Error('Пользователь не найден');
        }
        
        const user = JSON.parse(userData);
        
        // Проверяем пароль
        if (user.password !== btoa(password)) {
            throw new Error('Неверный пароль');
        }
        
        // Обновляем данные пользователя
        user.lastLogin = new Date().toISOString();
        user.stats.logins = (user.stats?.logins || 0) + 1;
        user.stats.lastActive = new Date().toISOString();
        
        // Сохраняем обновленного пользователя
        localStorage.setItem(`user_${email}`, JSON.stringify(user));
        
        // Устанавливаем как текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('last_login', new Date().toISOString());
        
        // Показываем успех
        showSuccess(`✅ Добро пожаловать, ${user.profile.name}!`, 2000);
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        loginBtn.style.backgroundColor = '#10b981';
        
        // Перенаправляем
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        const message = error.message === 'Неверный пароль' 
            ? 'Неверный пароль' 
            : 'Пользователь не найден';
        
        showError('loginPasswordError', message);
        
        // Восстанавливаем кнопку
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Восстановление пароля
async function sendPasswordResetCode() {
    const email = document.getElementById('forgotEmail')?.value.trim().toLowerCase();
    
    if (!email || !validateEmail(email)) {
        showError('forgotEmailError', 'Введите корректный email адрес');
        return;
    }
    
    // Проверяем существование пользователя
    if (!localStorage.getItem(`user_${email}`)) {
        showError('forgotEmailError', 'Пользователь с таким email не найден');
        return;
    }
    
    // Блокируем кнопку
    const forgotBtn = document.getElementById('forgotBtn');
    const originalText = forgotBtn.innerHTML;
    forgotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    forgotBtn.disabled = true;
    
    try {
        currentEmail = email;
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Отправляем email
        await emailjs.send(
            'artemoska',
            'template_8kpkiyr',
            {
                to_email: email,
                code: resetCode,
                subject: 'Восстановление пароля | Artemoska',
                message: `Ваш код для восстановления пароля: ${resetCode}\n\nКод действителен 15 минут.`
            }
        );
        
        // Сохраняем код восстановления
        localStorage.setItem(`reset_${email}`, JSON.stringify({
            code: resetCode,
            timestamp: Date.now(),
            email: email
        }));
        
        showSuccess(`✅ Код восстановления отправлен на ${email}`, 10000);
        showStep('resetPassword');
        
    } catch (error) {
        console.error('Ошибка отправки кода восстановления:', error);
        showError('forgotEmailError', 'Не удалось отправить код. Попробуйте позже.');
    } finally {
        forgotBtn.innerHTML = originalText;
        forgotBtn.disabled = false;
    }
}

// Сброс пароля
async function resetPassword() {
    const code = document.getElementById('resetCode')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmNewPassword')?.value;
    
    if (!code || code.length !== 6) {
        showError('resetCodeError', 'Введите 6-значный код');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showError('newPasswordError', 'Пароль должен быть не менее 6 символов');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('confirmNewPasswordError', 'Пароли не совпадают');
        return;
    }
    
    // Проверяем код
    const resetData = JSON.parse(localStorage.getItem(`reset_${currentEmail}`) || '{}');
    
    if (!resetData.code || resetData.code !== code) {
        showError('resetCodeError', 'Неверный код восстановления');
        return;
    }
    
    // Проверяем срок действия (15 минут)
    if (Date.now() - resetData.timestamp > 15 * 60 * 1000) {
        showError('resetCodeError', 'Код устарел');
        localStorage.removeItem(`reset_${currentEmail}`);
        return;
    }
    
    // Блокируем кнопку
    const resetBtn = document.getElementById('resetBtn');
    const originalText = resetBtn.innerHTML;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
    resetBtn.disabled = true;
    
    try {
        // Обновляем пароль
        const userData = localStorage.getItem(`user_${currentEmail}`);
        if (!userData) {
            throw new Error('Пользователь не найден');
        }
        
        const user = JSON.parse(userData);
        user.password = btoa(newPassword);
        user.updatedAt = new Date().toISOString();
        
        localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
        localStorage.removeItem(`reset_${currentEmail}`);
        
        showSuccess('✅ Пароль успешно изменен!', 3000);
        resetBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        resetBtn.style.backgroundColor = '#10b981';
        
        // Возвращаем к форме входа
        setTimeout(() => {
            showStep('login');
        }, 3000);
        
    } catch (error) {
        showError('resetCodeError', error.message);
        resetBtn.innerHTML = originalText;
        resetBtn.disabled = false;
    }
}

// Смена шагов формы
function showStep(step) {
    // Скрываем все шаги
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Показываем нужный шаг
    const stepMap = {
        '1': 'step1',
        'register': 'stepRegister',
        'verify-register': 'stepVerifyRegister',
        'login': 'stepLogin',
        'forgotPassword': 'stepForgotPassword',
        'resetPassword': 'stepResetPassword'
    };
    
    const stepId = stepMap[step] || 'step1';
    const stepElement = document.getElementById(stepId);
    
    if (stepElement) {
        stepElement.classList.add('active');
        
        // Фокус на первое поле
        setTimeout(() => {
            const firstInput = stepElement.querySelector('input');
            if (firstInput) {
                firstInput.focus();
                
                // Для полей кода - очищаем предыдущие значения
                if (step === 'verify-register') {
                    document.querySelectorAll('.code-input').forEach(input => {
                        input.value = '';
                        input.style.borderColor = '#e5e7eb';
                        input.style.backgroundColor = '';
                    });
                    document.getElementById('code1')?.focus();
                }
            }
        }, 100);
    }
}
