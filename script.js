function toggleThemeMenu() {
  const menu = document.getElementById("theme-menu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function closeThemeMenu() {
  document.getElementById("theme-menu").style.display = "none";
}

function setTheme(theme) {
  document.body.className = ""; // Сброс всех тем

  if (theme === "grey") {
    document.body.style.background = "linear-gradient(135deg, #2c2c2c, #b0b0b0)";
  } else if (theme === "rainbow") {
    document.body.style.background = "linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)";
  } else {
    document.body.classList.add("gradient-background"); // Вернуть переливающийся градиент
  }

  closeThemeMenu();
}
