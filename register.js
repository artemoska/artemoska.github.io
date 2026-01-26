import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";

emailjs.init("dqDwAfC5HAi1bp0q3"); // твой Public Key

const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyBtn = document.getElementById("verifyBtn");
const emailInput = document.getElementById("email");
const codeInput = document.getElementById("codeInput");
const message = document.getElementById("message");

let generatedCode = "";

sendCodeBtn.onclick = async () => {
  const email = emailInput.value.trim();
  if (!email) {
    message.textContent = "Введите email";
    return;
  }

  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Проверка, что переменные точно совпадают с шаблоном
    await emailjs.send(
      "artemoska",               // Service ID
      "template_8kpkiyr",        // Template ID
      {
        to_email: email,         // Должно совпадать с {{to_email}} в шаблоне
        code: generatedCode      // Должно совпадать с {{code}} в шаблоне
      }
    );
    message.textContent = "Код отправлен на почту";
  } catch (err) {
    console.error(err); // Смотри здесь ошибку EmailJS
    message.textContent = "Ошибка отправки, смотри консоль";
  }
};

verifyBtn.onclick = () => {
  if (!generatedCode) {
    message.textContent = "Сначала получите код";
    return;
  }
  if (codeInput.value.trim() === generatedCode) {
    message.textContent = "Код верный";
  } else {
    message.textContent = "Неверный код";
  }
};
