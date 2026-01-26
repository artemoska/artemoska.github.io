// Упрощенная система регистрации - ВСЁ РАБОТАЕТ!
document.addEventListener('DOMContentLoaded', function() {
    console.log('Система регистрации загружена');
    
    // Инициализация EmailJS
    try {
        emailjs.init("dqDwAfC5HAi1bp0q3");
        console.log('EmailJS инициализирован');
    } catch (error) {
        console.log('EmailJS в тестовом режиме:', error);
    }
    
    // Инициализируем обработчики событий
    initEventHandlers();
});

// Глобальные переменные
let currentEmail = '';
let verificationCode = '';
let resendTimer = null;

// Инициализация обработчиков событий
function initEventHandlers() {
    // Автофокус на следующий input кода
    const codeInputs = document.querySelectorAll('.code-input');
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            // Если ввели все символы, автоматически проверяем
            if (index === codeInputs.length - 1 && e.target.value.length === 1) {
                const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
                if (allFilled) {
                    verifyRegistrationCode();
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
    
    // Обработчик Enter в полях
    document.getElementById('regEmail')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendVerificationCode();
    });
    
    document.getElementById('regPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendVerificationCode();
    });
    
    document.getElementById('regConfirmPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendVerificationCode();
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
        element.style.color = '#ef4444';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Показать сообщение об успехе
function showSuccess(message) {
    const element = document.getElementById('successMessage');
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#10b981';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Отправка кода подтверждения
async function sendVerificationCode() {
    console.log('Функция sendVerificationCode вызвана');
    
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
    
    // Проверяем, не зарегистрирован ли уже пользователь
    const existingUser = localStorage.getItem(`user_${email}`);
    if (existingUser) {
        showError('regEmailError', 'Пользователь с таким email уже существует');
        return;
    }
    
    // Генерируем код
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    currentEmail = email;
    
    // Сохраняем код для проверки
    localStorage.setItem(`code_${email}`, JSON.stringify({
        code: verificationCode,
        timestamp: Date.now(),
        password: btoa(password) // Простое "шифрование"
    }));
    
    // Показываем код пользователю (вместо отправки email)
    showCodePopup(verificationCode, email);
    
    // Переходим к подтверждению
    document.getElementById('emailDisplay').textContent = email;
    showStep('verify-register');
    startResendTimer();
    
    // Очищаем поля пароля (для безопасности)
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
}

// Показ кода в попапе (вместо отправки email)
function showCodePopup(code, email) {
    // Удаляем старый попап если есть
    const oldPopup = document.getElementById('codePopup');
    if (oldPopup) oldPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'codePopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 300px;
        max-width: 90%;
        border: 3px solid #6366f1;
    `;
    
    popup.innerHTML = `
        <div style="position: absolute; top: 10px; right: 10px;">
            <button onclick="document.getElementById('codePopup').remove()" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">
                ×
            </button>
        </div>
        
        <div style="color: #6366f1; font-size: 48px; margin-bottom: 10px;">
            <i class="fas fa-mail-bulk"></i>
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 15px;">Код подтверждения</h3>
        
        <p style="margin-bottom: 10px; color: #666;">
            Для email: <strong>${email}</strong>
        </p>
        
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 32px;
            font-weight: bold;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            letter-spacing: 5px;
        ">
            ${code}
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Введите этот код в форму подтверждения<br>
            (В реальной системе код отправляется на email)
        </p>
        
        <button onclick="copyCode('${code}')" 
                style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 5px;
                ">
            <i class="fas fa-copy"></i> Скопировать код
        </button>
        
        <button onclick="document.getElementById('codePopup').remove()" 
                style="
                    background: #6366f1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 5px;
                ">
            Понятно
        </button>
    `;
    
    document.body.appendChild(popup);
}

// Копирование кода в буфер обмена
function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.querySelector('#codePopup button[onclick*="copyCode"]');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    });
}

// Таймер для повторной отправки
function startResendTimer() {
    clearInterval(resendTimer);
    
    const countdownElement = document.getElementById('countdown');
    const timerText = document.getElementById('timerText');
    const resendContainer = document.getElementById('resendContainer');
    
    if (!countdownElement || !timerText || !resendContainer) return;
    
    let timeLeft = 60;
    
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
function resendCode() {
    if (!currentEmail) {
        showError('verifyBtn', 'Сначала введите email');
        showStep('register');
        return;
    }
    
    // Генерируем новый код
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Обновляем сохраненный код
    const savedData = JSON.parse(localStorage.getItem(`code_${currentEmail}`) || '{}');
    savedData.code = verificationCode;
    savedData.timestamp = Date.now();
    localStorage.setItem(`code_${currentEmail}`, JSON.stringify(savedData));
    
    // Показываем новый код
    showCodePopup(verificationCode, currentEmail);
    
    // Сбрасываем таймер
    startResendTimer();
    
    // Очищаем поля кода
    document.querySelectorAll('.code-input').forEach(input => {
        input.value = '';
    });
    document.getElementById('code1').focus();
    
    showSuccess('Новый код отправлен!');
}

// Подтверждение кода и создание аккаунта
async function verifyRegistrationCode() {
    console.log('Функция verifyRegistrationCode вызвана');
    
    // Собираем код из всех input'ов
    const codeInputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
    
    if (enteredCode.length !== 6) {
        showError('verifyBtn', 'Введите все 6 цифр кода');
        return;
    }
    
    // Получаем сохраненные данные
    const savedData = JSON.parse(localStorage.getItem(`code_${currentEmail}`) || '{}');
    
    if (!savedData.code) {
        showError('verifyBtn', 'Код не найден. Запросите новый код.');
        return;
    }
    
    // Проверяем срок действия кода (10 минут)
    const codeAge = Date.now() - savedData.timestamp;
    if (codeAge > 10 * 60 * 1000) {
        showError('verifyBtn', 'Код устарел. Запросите новый.');
        return;
    }
    
    // Проверяем код
    if (enteredCode !== savedData.code) {
        showError('verifyBtn', 'Неверный код. Попробуйте еще раз.');
        return;
    }
    
    // Код верный - создаем пользователя
    const user = {
        id: Date.now(),
        email: currentEmail,
        password: savedData.password,
        verified: true,
        createdAt: new Date().toISOString(),
        profile: {
            name: currentEmail.split('@')[0],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmail)}&background=6366f1&color=fff`
        }
    };
    
    // Сохраняем пользователя
    localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
    
    // Устанавливаем текущего пользователя
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Удаляем использованный код
    localStorage.removeItem(`code_${currentEmail}`);
    
    // Показываем успех
    showSuccess('🎉 Аккаунт успешно создан!');
    
    // Меняем текст кнопки
    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Успешно! Перенаправляем...';
        verifyBtn.disabled = true;
    }
    
    // Перенаправляем на главную через 2 секунды
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Вход пользователя
async function loginUser() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !validateEmail(email)) {
        showError('loginEmailError', 'Введите корректный email');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('loginPasswordError', 'Введите пароль');
        return;
    }
    
    // Получаем пользователя
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
        showError('loginPasswordError', 'Пользователь не найден');
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Проверяем пароль
    if (user.password !== btoa(password)) {
        showError('loginPasswordError', 'Неверный пароль');
        return;
    }
    
    // Устанавливаем текущего пользователя
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Показываем успех
    showSuccess('Вход выполнен!');
    
    // Меняем текст кнопки
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        loginBtn.disabled = true;
    }
    
    // Перенаправляем на главную
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Смена шага формы
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
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Восстановление пароля
function sendPasswordResetCode() {
    const email = document.getElementById('forgotEmail')?.value;
    
    if (!email || !validateEmail(email)) {
        showError('forgotEmailError', 'Введите корректный email');
        return;
    }
    
    // Проверяем, существует ли пользователь
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
        showError('forgotEmailError', 'Пользователь не найден');
        return;
    }
    
    currentEmail = email;
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код для восстановления
    localStorage.setItem(`reset_${email}`, JSON.stringify({
        code: verificationCode,
        timestamp: Date.now()
    }));
    
    // Показываем код
    showCodePopup(verificationCode, email);
    
    // Переходим к сбросу пароля
    showStep('resetPassword');
}

// Сброс пароля
function resetPassword() {
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
    const savedData = JSON.parse(localStorage.getItem(`reset_${currentEmail}`) || '{}');
    
    if (!savedData.code || savedData.code !== code) {
        showError('resetCodeError', 'Неверный код');
        return;
    }
    
    // Получаем пользователя
    const userData = localStorage.getItem(`user_${currentEmail}`);
    if (!userData) {
        showError('resetCodeError', 'Пользователь не найден');
        return;
    }
    
    // Обновляем пароль
    const user = JSON.parse(userData);
    user.password = btoa(newPassword);
    localStorage.setItem(`user_${currentEmail}`, JSON.stringify(user));
    
    // Удаляем код восстановления
    localStorage.removeItem(`reset_${currentEmail}`);
    
    showSuccess('Пароль успешно изменен!');
    
    // Возвращаем к форме входа
    setTimeout(() => {
        showStep('login');
    }, 2000);
}

// Для отладки - создаем тестовых пользователей
function createTestUsers() {
    const testUsers = [
        { email: 'test@example.com', password: 'test123' },
        { email: 'user@mail.ru', password: 'password123' }
    ];
    
    testUsers.forEach(({ email, password }) => {
        if (!localStorage.getItem(`user_${email}`)) {
            const user = {
                id: Date.now(),
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
    
    console.log('Тестовые пользователи созданы');
}

// Создаем тестовых пользователей при загрузке
setTimeout(createTestUsers, 1000);
