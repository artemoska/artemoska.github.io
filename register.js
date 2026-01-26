// Система аутентификации Artemoska
// Использует localStorage для хранения пользователей и EmailJS для отправки кодов
// Переменная для тестового режима
const TEST_MODE = true;

// Переопределяем отправку email
const originalSendEmail = emailjs.send;
emailjs.send = async function(service, template, data) {
    if (TEST_MODE) {
        console.log('Тестовый режим - пропускаем отправку');
        console.log('Данные:', { service, template, data });
        
        // Показываем код пользователю
        if (data.code) {
            alert(`Код подтверждения: ${data.code}\n(в реальной системе отправлен на ${data.to_email})`);
        }
        
        return { status: 200, text: 'OK' };
    }
    
    return originalSendEmail.call(this, service, template, data);
};

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('artemoska_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('artemoska_current_user')) || null;
        this.verificationCodes = JSON.parse(localStorage.getItem('artemoska_codes')) || {};
        
        this.init();
    }
    
    init() {
        console.log('AuthSystem инициализирован');
        
        // Проверяем авторизацию
        if (this.currentUser) {
            this.redirectToMain();
        }
        
        // Сохраняем пользователей в localStorage при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }
    
    saveData() {
        localStorage.setItem('artemoska_users', JSON.stringify(this.users));
        localStorage.setItem('artemoska_current_user', JSON.stringify(this.currentUser));
        localStorage.setItem('artemoska_codes', JSON.stringify(this.verificationCodes));
    }
    
    // Генерация 6-значного кода
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Отправка кода на email
    async sendEmailCode(email, code, type = 'registration') {
        try {
            let templateId;
            let templateData;
            
            if (type === 'registration') {
                templateId = 'template_8kpkiyr';
                templateData = {
                    to_email: email,
                    code: code,
                    subject: 'Код подтверждения регистрации',
                    message: `Ваш код подтверждения: ${code}`
                };
            } else if (type === 'reset') {
                templateId = 'template_8kpkiyr'; // Можно создать отдельный шаблон
                templateData = {
                    to_email: email,
                    code: code,
                    subject: 'Код восстановления пароля',
                    message: `Ваш код для восстановления пароля: ${code}`
                };
            }
            
            const response = await emailjs.send(
                'artemoska', // Service ID
                templateId,
                templateData
            );
            
            console.log('Email sent:', response);
            return true;
        } catch (error) {
            console.error('Ошибка отправки email:', error);
            return false;
        }
    }
    
    // Сохранение кода для email
    saveVerificationCode(email, code, type = 'registration') {
        this.verificationCodes[email] = {
            code: code,
            timestamp: Date.now(),
            type: type,
            attempts: 0
        };
        this.saveData();
        
        // Автоудаление кода через 10 минут
        setTimeout(() => {
            if (this.verificationCodes[email] && 
                Date.now() - this.verificationCodes[email].timestamp > 600000) {
                delete this.verificationCodes[email];
                this.saveData();
            }
        }, 600000);
    }
    
    // Проверка кода
    verifyCode(email, code) {
        const savedCode = this.verificationCodes[email];
        
        if (!savedCode) {
            return { success: false, message: 'Код не найден или устарел' };
        }
        
        // Проверяем количество попыток
        if (savedCode.attempts >= 5) {
            return { success: false, message: 'Слишком много попыток. Запросите новый код.' };
        }
        
        // Проверяем срок действия (10 минут)
        if (Date.now() - savedCode.timestamp > 600000) {
            delete this.verificationCodes[email];
            this.saveData();
            return { success: false, message: 'Код устарел' };
        }
        
        // Увеличиваем счетчик попыток
        savedCode.attempts++;
        this.saveData();
        
        if (savedCode.code === code) {
            delete this.verificationCodes[email];
            this.saveData();
            return { success: true, type: savedCode.type };
        }
        
        return { success: false, message: 'Неверный код' };
    }
    
    // Регистрация пользователя
    registerUser(email, password) {
        // Проверяем, существует ли пользователь
        if (this.getUserByEmail(email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }
        
        // Проверяем валидность пароля
        if (password.length < 6) {
            return { success: false, message: 'Пароль должен быть не менее 6 символов' };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            email: email.toLowerCase(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            verified: false,
            level: 1,
            achievements: ['welcome'],
            profile: {
                name: email.split('@')[0],
                avatar: this.generateAvatar(email)
            }
        };
        
        this.users.push(newUser);
        this.saveData();
        
        return { success: true, user: newUser };
    }
    
    // Авторизация пользователя
    loginUser(email, password) {
        const user = this.getUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Неверный пароль' };
        }
        
        if (!user.verified) {
            return { success: false, message: 'Email не подтвержден', needVerification: true };
        }
        
        this.currentUser = user;
        this.saveData();
        
        return { success: true, user: user };
    }
    
    // Получить пользователя по email
    getUserByEmail(email) {
        return this.users.find(user => user.email === email.toLowerCase());
    }
    
    // Простое хеширование пароля (в реальном проекте используй bcrypt)
    hashPassword(password) {
        return btoa(password + 'artemoska_salt_2025');
    }
    
    // Генерация аватара на основе email
    generateAvatar(email) {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const color = colors[email.length % colors.length];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=${color.slice(1)}&color=fff&bold=true`;
    }
    
    // Сброс пароля
    resetPassword(email, code, newPassword) {
        const verification = this.verifyCode(email, code);
        
        if (!verification.success || verification.type !== 'reset') {
            return { success: false, message: verification.message };
        }
        
        const user = this.getUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        if (newPassword.length < 6) {
            return { success: false, message: 'Пароль должен быть не менее 6 символов' };
        }
        
        user.password = this.hashPassword(newPassword);
        this.saveData();
        
        return { success: true };
    }
    
    // Подтверждение email после регистрации
    confirmEmail(email, code) {
        const verification = this.verifyCode(email, code);
        
        if (!verification.success || verification.type !== 'registration') {
            return { success: false, message: verification.message };
        }
        
        const user = this.getUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        user.verified = true;
        this.currentUser = user;
        this.saveData();
        
        return { success: true, user: user };
    }
    
    // Перенаправление на главную
    redirectToMain() {
        window.location.href = 'index.html';
    }
}

// Инициализация системы
const authSystem = new AuthSystem();

// Глобальные переменные
let currentEmail = '';
let resendTimer = null;

// Функции для взаимодействия с UI

// Отправка кода подтверждения
async function sendVerificationCode() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Валидация
    if (!validateEmail(email)) {
        showError('regEmailError', 'Введите корректный email');
        return;
    }
    
    if (password.length < 6) {
        showError('regPasswordError', 'Пароль должен быть не менее 6 символов');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('regConfirmPasswordError', 'Пароли не совпадают');
        return;
    }
    
    // Проверяем, не зарегистрирован ли уже пользователь
    if (authSystem.getUserByEmail(email)) {
        showError('regEmailError', 'Пользователь с таким email уже существует');
        return;
    }
    
    // Генерируем и отправляем код
    const code = authSystem.generateCode();
    currentEmail = email;
    
    // Показываем отладочную информацию
    if (document.getElementById('debugInfo').style.display !== 'none') {
        document.getElementById('debugCode').textContent = code;
        document.getElementById('debugEmail').textContent = email;
    }
    
    // Сохраняем код в системе
    authSystem.saveVerificationCode(email, code, 'registration');
    
    // Отправляем email
    const sendBtn = document.getElementById('sendCodeBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    sendBtn.disabled = true;
    
    try {
        const emailSent = await authSystem.sendEmailCode(email, code, 'registration');
        
        if (emailSent) {
            // Переходим к подтверждению
            document.getElementById('emailDisplay').textContent = email;
            showStep('verify-register');
            startResendTimer();
            showSuccess('Код отправлен на вашу почту!');
        } else {
            showError('regEmailError', 'Ошибка отправки email. Проверьте email или попробуйте позже.');
        }
    } catch (error) {
        showError('regEmailError', 'Ошибка отправки: ' + error.message);
    } finally {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

// Подтверждение кода регистрации
async function verifyRegistrationCode() {
    const codeInputs = document.querySelectorAll('.code-input');
    const code = Array.from(codeInputs).map(input => input.value).join('');
    
    if (code.length !== 6) {
        showError('verifyBtn', 'Введите все 6 цифр кода');
        return;
    }
    
    const verifyBtn = document.getElementById('verifyBtn');
    const originalText = verifyBtn.innerHTML;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
    verifyBtn.disabled = true;
    
    try {
        const result = authSystem.confirmEmail(currentEmail, code);
        
        if (result.success) {
            // Создаем пользователя
            const password = document.getElementById('regPassword').value;
            const registerResult = authSystem.registerUser(currentEmail, password);
            
            if (registerResult.success) {
                showSuccess('Аккаунт успешно создан!');
                
                // Автоматически авторизуем пользователя
                authSystem.currentUser = registerResult.user;
                authSystem.saveData();
                
                // Перенаправляем на главную через 2 секунды
                setTimeout(() => {
                    authSystem.redirectToMain();
                }, 2000);
            } else {
                showError('verifyBtn', registerResult.message);
            }
        } else {
            showError('verifyBtn', result.message);
        }
    } catch (error) {
        showError('verifyBtn', 'Ошибка: ' + error.message);
    } finally {
        verifyBtn.innerHTML = originalText;
        verifyBtn.disabled = false;
    }
}

// Вход пользователя
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showError('loginEmailError', 'Введите корректный email');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
    loginBtn.disabled = true;
    
    try {
        const result = authSystem.loginUser(email, password);
        
        if (result.success) {
            showSuccess('Вход выполнен успешно!');
            
            // Перенаправляем на главную через 1 секунду
            setTimeout(() => {
                authSystem.redirectToMain();
            }, 1000);
        } else {
            if (result.needVerification) {
                // Нужно подтвердить email
                showError('loginEmailError', 'Email не подтвержден. Проверьте почту для кода подтверждения.');
                currentEmail = email;
                showStep('verify-register');
                startResendTimer();
            } else {
                showError('loginPasswordError', result.message);
            }
        }
    } catch (error) {
        showError('loginPasswordError', 'Ошибка входа: ' + error.message);
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Отправка кода восстановления пароля
async function sendPasswordResetCode() {
    const email = document.getElementById('forgotEmail').value;
    
    if (!validateEmail(email)) {
        showError('forgotEmailError', 'Введите корректный email');
        return;
    }
    
    // Проверяем, существует ли пользователь
    if (!authSystem.getUserByEmail(email)) {
        showError('forgotEmailError', 'Пользователь с таким email не найден');
        return;
    }
    
    const forgotBtn = document.getElementById('forgotBtn');
    const originalText = forgotBtn.innerHTML;
    forgotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    forgotBtn.disabled = true;
    
    try {
        const code = authSystem.generateCode();
        currentEmail = email;
        
        // Сохраняем код
        authSystem.saveVerificationCode(email, code, 'reset');
        
        // Отправляем email
        const emailSent = await authSystem.sendEmailCode(email, code, 'reset');
        
        if (emailSent) {
            showSuccess('Код восстановления отправлен на вашу почту!');
            showStep('resetPassword');
            startResendTimer();
        } else {
            showError('forgotEmailError', 'Ошибка отправки email');
        }
    } catch (error) {
        showError('forgotEmailError', 'Ошибка: ' + error.message);
    } finally {
        forgotBtn.innerHTML = originalText;
        forgotBtn.disabled = false;
    }
}

// Сброс пароля
async function resetPassword() {
    const code = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (code.length !== 6) {
        showError('resetCodeError', 'Введите 6-значный код');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('newPasswordError', 'Пароль должен быть не менее 6 символов');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('confirmNewPasswordError', 'Пароли не совпадают');
        return;
    }
    
    const resetBtn = document.getElementById('resetBtn');
    const originalText = resetBtn.innerHTML;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сброс...';
    resetBtn.disabled = true;
    
    try {
        const result = authSystem.resetPassword(currentEmail, code, newPassword);
        
        if (result.success) {
            showSuccess('Пароль успешно изменен!');
            
            // Возвращаем к форме входа
            setTimeout(() => {
                showStep('login');
            }, 2000);
        } else {
            showError('resetCodeError', result.message);
        }
    } catch (error) {
        showError('resetCodeError', 'Ошибка: ' + error.message);
    } finally {
        resetBtn.innerHTML = originalText;
        resetBtn.disabled = false;
    }
}

// Вспомогательные функции

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
    
    // Автоскрытие ошибки через 5 секунд
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    const element = document.getElementById('successMessage');
    element.textContent = message;
    element.classList.add('show');
    
    // Автоскрытие успеха через 5 секунд
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Таймер для повторной отправки кода
function startResendTimer() {
    clearInterval(resendTimer);
    
    const countdownElement = document.getElementById('countdown');
    const timerText = document.getElementById('timerText');
    const resendContainer = document.getElementById('resendContainer');
    
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
async function resendCode() {
    const code = authSystem.generateCode();
    
    // Определяем тип кода
    const savedCode = authSystem.verificationCodes[currentEmail];
    const type = savedCode ? savedCode.type : 'registration';
    
    // Сохраняем новый код
    authSystem.saveVerificationCode(currentEmail, code, type);
    
    // Отправляем email
    try {
        await authSystem.sendEmailCode(currentEmail, code, type);
        showSuccess('Новый код отправлен на вашу почту!');
        startResendTimer();
    } catch (error) {
        showError('verifyBtn', 'Ошибка отправки: ' + error.message);
    }
}

// Для отладки: создаем тестового пользователя
function createTestUser() {
    const testUsers = [
        { email: 'test@mail.com', password: 'test123' },
        { email: 'user@example.com', password: 'password123' }
    ];
    
    testUsers.forEach(user => {
        if (!authSystem.getUserByEmail(user.email)) {
            authSystem.registerUser(user.email, user.password);
            const registeredUser = authSystem.getUserByEmail(user.email);
            if (registeredUser) {
                registeredUser.verified = true;
            }
        }
    });
    
    authSystem.saveData();
    console.log('Тестовые пользователи созданы');
}

// Запускаем создание тестовых пользователей при загрузке (для удобства)
if (document.getElementById('debugInfo').style.display !== 'none') {
    createTestUser();
}
