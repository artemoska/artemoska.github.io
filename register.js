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
    await emailjs.send(
      "artemoska",
      "template_8kpkiyr",
      {
        to_email: email,
        code: generatedCode
      }
    );
    message.textContent = "Код отправлен на почту";
  } catch (e) {
    console.error(e);
    message.textContent = "Ошибка отправки (см. консоль)";
  }
};

verifyBtn.onclick = () => {
  if (codeInput.value === generatedCode) {
    message.textContent = "Код верный";
  } else {
    message.textContent = "Неверный код";
  }
};
