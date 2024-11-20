// Navigation
document.addEventListener('DOMContentLoaded', () => {
  const menuBurger = document.querySelector('.menu-burger');
  const menu = document.querySelector('.nav-items');

  menuBurger.addEventListener('click', () => {
      menu.classList.toggle('show');
  });
});