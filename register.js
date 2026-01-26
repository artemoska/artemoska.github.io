import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";

// Инициализация EmailJS с твоим Public Key
emailjs.init("dqDwAfC5HAi1bp0q3");

const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyBtn = document.getElementById("verifyBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const codeInput = document.getElementById("codeInput");
const message = document.getElementById("message");

let generatedCode = "";

sendCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Заполните все поля";
    return;
  }

  // Генерация 6-значного кода
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await emailjs.send(
      "artemoska",               // Service ID
      "template_8kpkiyr",        // Template ID
      {
        to_email: email,         // Email пользователя
        code: generatedCode      // 6-значный код
      }
    );
    message.textContent = "Код отправлен на почту";
  } catch (err) {
    message.textContent = "Ошибка отправки: " + err;
  }
});

verifyBtn.addEventListener("click", () => {
  if (codeInput.value === generatedCode) {
    message.textContent = "Код верный! Регистрация успешна.";
    // Здесь можно добавить Firebase Auth создание пользователя
  } else {
    message.textContent = "Неверный код";
  }
});
