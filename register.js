// Система регистрации с отправкой на email
document.addEventListener('DOMContentLoaded', function() {
    console.log('Система регистрации загружена');
    
    // Инициализация EmailJS
    try {
        emailjs.init("dqDwAfC5HAi1bp0q3");
        console.log('EmailJS инициализирован');
    } catch (error) {
        console.error('Ошибка EmailJS:', error);
        showError('regEmailError', 'Ошибка инициализации email сервиса');
    }
    
    // Инициализируем обработчики
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

// Показать/скрыть сообщения
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 5000);
    }
}

function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        setTimeout(() => successEl.style.display = 'none', 5000);
    }
}

// Отправка кода подтверждения (ТОЛЬКО на email)
async function sendVerificationCode() {
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    
    // Валидация
    if (!email || !validateEmail(email)) {
        showError('regEmailError', 'Введите корректный email');
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
    if (localStorage.getItem(`user_${email}`)) {
        showError('regEmailError', 'Пользователь с таким email уже существует');
        return;
    }
    
    // Блокируем кнопку
    const sendBtn = document.getElementById('sendCodeBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    sendBtn.disabled = true;
    
    try {
        // Генерируем код
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        currentEmail = email;
        
        // Отправляем email через EmailJS
        const emailResult = await emailjs.send(
            'artemoska', // Service ID
            'template_8kpkiyr', // Template ID
            {
                to_email: email,
                code: verificationCode,
                subject: 'Код подтверждения регистрации',
                message: `Ваш код подтверждения: ${verificationCode}`
            }
        );
        
        if (emailResult.status === 200) {
            // Сохраняем данные для проверки
            localStorage.setItem(`pending_${email}`, JSON.stringify({
                code: verificationCode,
                password: btoa(password),
                timestamp: Date.now()
            }));
            
            // Показываем успех
            showSuccess(`Код отправлен на ${email}`);
            
            // Переходим к подтверждению
            document.getElementById('emailDisplay').textContent = email;
            showStep('verify-register');
            startResendTimer();
            
            // Очищаем пароли
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        } else {
            showError('regEmailError', 'Ошибка отправки email');
        }
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showError('regEmailError', `Ошибка отправки: ${error.text || error.message}`);
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
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    
    try {
        // Генерируем новый код
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Отправляем email
        await emailjs.send(
            'artemoska',
            'template_8kpkiyr',
            {
                to_email: currentEmail,
                code: newCode,
                subject: 'Новый код подтверждения',
                message: `Ваш новый код подтверждения: ${newCode}`
            }
        );
        
        // Обновляем сохраненный код
        const pendingData = JSON.parse(localStorage.getItem(`pending_${currentEmail}`) || '{}');
        pendingData.code = newCode;
        pendingData.timestamp = Date.now();
        localStorage.setItem(`pending_${currentEmail}`, JSON.stringify(pendingData));
        
        // Показываем успех
        showSuccess('Новый код отправлен на вашу почту');
        
        // Сбрасываем таймер
        startResendTimer();
        
        // Очищаем поля ввода
        document.querySelectorAll('.code-input').forEach(input => input.value = '');
        document.getElementById('code1').focus();
        
    } catch (error) {
        showError('verifyBtn', 'Ошибка отправки: ' + (error.text || error.message));
    } finally {
        // Восстанавливаем ссылку через 5 секунд
        setTimeout(() => {
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
        }, 5000);
    }
}

// Подтверждение кода
async function verifyRegistrationCode() {
    // Собираем код
    const codeInputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
    
    if (enteredCode.length !== 6) {
        showError('verifyBtn', 'Введите все 6 цифр кода');
        return;
    }
    
    // Получаем сохраненные данные
    const pendingData = JSON.parse(localStorage.getItem(`pending_${currentEmail}`) || '{}');
    
    if (!pendingData.code) {
        showError('verifyBtn', 'Код не найден. Запросите новый.');
        return;
    }
    
    // Проверяем срок действия (15 минут)
    const codeAge = Date.now() - pendingData.timestamp;
    if (codeAge > 15 * 60 * 1000) {
        showError('verifyBtn', 'Код устарел. Запросите новый.');
        localStorage.removeItem(`pending_${currentEmail}`);
        return;
    }
    
    // Проверяем код
    if (enteredCode !== pendingData.code) {
        showError('verifyBtn', 'Неверный код. Попробуйте еще раз.');
        return;
    }
    
    // Блокируем кнопку
    const verifyBtn = document.getElementById('verifyBtn');
    const originalText = verifyBtn.innerHTML;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание аккаунта...';
    verifyBtn.disabled = true;
    
    try {
        // Создаем пользователя
        const user = {
            id: 'user_' + Date.now(),
            email: currentEmail,
            password: pendingData.password,
            verified: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profile: {
                name: currentEmail.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmail)}&background=6366f1&color=fff&bold=true`
            }
        };
        
        // Сохраняем пользователя
        localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Удаляем временные данные
        localStorage.removeItem(`pending_${currentEmail}`);
        
        // Показываем успех
        showSuccess('🎉 Аккаунт успешно создан!');
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Успешно! Перенаправляем...';
        
        // Перенаправляем через 2 секунды
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        showError('verifyBtn', 'Ошибка создания аккаунта: ' + error.message);
        verifyBtn.innerHTML = originalText;
        verifyBtn.disabled = false;
    }
}

// Вход в систему
async function loginUser() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !validateEmail(email)) {
        showError('loginEmailError', 'Введите корректный email');
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
            showError('loginPasswordError', 'Пользователь не найден');
            throw new Error('User not found');
        }
        
        const user = JSON.parse(userData);
        
        // Проверяем пароль
        if (user.password !== btoa(password)) {
            showError('loginPasswordError', 'Неверный пароль');
            throw new Error('Wrong password');
        }
        
        // Обновляем последний вход
        user.lastLogin = new Date().toISOString();
        localStorage.setItem(`user_${email}`, JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Показываем успех
        showSuccess('Вход выполнен!');
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        
        // Перенаправляем
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        // Ошибка уже обработана в showError
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Восстановление пароля
async function sendPasswordResetCode() {
    const email = document.getElementById('forgotEmail')?.value;
    
    if (!email || !validateEmail(email)) {
        showError('forgotEmailError', 'Введите корректный email');
        return;
    }
    
    // Проверяем существование пользователя
    if (!localStorage.getItem(`user_${email}`)) {
        showError('forgotEmailError', 'Пользователь не найден');
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
                subject: 'Код восстановления пароля',
                message: `Ваш код для восстановления пароля: ${resetCode}`
            }
        );
        
        // Сохраняем код восстановления
        localStorage.setItem(`reset_${email}`, JSON.stringify({
            code: resetCode,
            timestamp: Date.now()
        }));
        
        showSuccess('Код восстановления отправлен на вашу почту');
        showStep('resetPassword');
        
    } catch (error) {
        showError('forgotEmailError', 'Ошибка отправки: ' + (error.text || error.message));
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
    
    // Получаем сохраненный код
    const resetData = JSON.parse(localStorage.getItem(`reset_${currentEmail}`) || '{}');
    
    if (!resetData.code || resetData.code !== code) {
        showError('resetCodeError', 'Неверный код');
        return;
    }
    
    // Проверяем срок действия
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
        // Обновляем пароль пользователя
        const userData = localStorage.getItem(`user_${currentEmail}`);
        if (!userData) {
            throw new Error('Пользователь не найден');
        }
        
        const user = JSON.parse(userData);
        user.password = btoa(newPassword);
        localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
        
        // Удаляем код восстановления
        localStorage.removeItem(`reset_${currentEmail}`);
        
        showSuccess('Пароль успешно изменен!');
        resetBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        
        // Возвращаем к форме входа
        setTimeout(() => {
            showStep('login');
        }, 2000);
        
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
    const stepId = {
        '1': 'step1',
        'register': 'stepRegister',
        'verify-register': 'stepVerifyRegister',
        'login': 'stepLogin',
        'forgotPassword': 'stepForgotPassword',
        'resetPassword': 'stepResetPassword'
    }[step] || 'step1';
    
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
        stepElement.classList.add('active');
        // Фокус на первое поле
        setTimeout(() => {
            const firstInput = stepElement.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Создаем тестовых пользователей (только для разработки)
function createTestUsers() {
    const testUsers = [
        { email: 'test@example.com', password: 'test123' }
    ];
    
    testUsers.forEach(({ email, password }) => {
        if (!localStorage.getItem(`user_${email}`)) {
            const user = {
                id: 'user_' + Date.now(),
                email: email,
                password: btoa(password),
                verified: true,
                createdAt: new Date().toISOString(),
                profile: {
                    name: email.split('@')[0],
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=6366f1&color=fff`
                }
            };
            localStorage.setItem(`user_${email}`, JSON.stringify(user));
        }
    });
}

// Удаляем отладочную информацию из HTML
document.addEventListener('DOMContentLoaded', function() {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) debugInfo.remove();
    
    // Создаем тестовых пользователей (только при первом запуске)
    if (!localStorage.getItem('test_users_created')) {
        createTestUsers();
        localStorage.setItem('test_users_created', 'true');
    }
});
