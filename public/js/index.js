import '@babel/polyfill';
import { login, logout } from './login';
import { mapBox } from './mapbox';

// DOM
const formLogin = document.querySelector('.form');
const mapSection = document.getElementById('map');
const logoutButton = document.querySelector('.nav__el--logout');

// LOGIN
if (formLogin) {
  formLogin.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

// LOCATION
if (mapSection) {
  const locations = JSON.parse(mapSection.dataset.locations);
  mapBox(locations);
}

// LOGOUT
if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
