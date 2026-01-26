// Инициализация EmailJS
emailjs.init("dqDwAfC5HAi1bp0q3"); // твой Public Key

const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyBtn = document.getElementById("verifyBtn");
const emailInput = document.getElementById("email");
const codeInput = document.getElementById("codeInput");
const message = document.getElementById("message");

let generatedCode = "";

sendCodeBtn.onclick = function () {
  const email = emailInput.value.trim();
  if (!email) {
    message.textContent = "Введите email";
    return;
  }

  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

  emailjs.send(
    "artemoska",               // Service ID
    "template_8kpkiyr",        // Template ID
    { to_email: email, code: generatedCode }
  )
  .then(function() {
    message.textContent = "Код отправлен на почту";
  }, function(err) {
    console.error(err);
    message.textContent = "Ошибка отправки, смотри консоль";
  });
};

verifyBtn.onclick = function () {
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
