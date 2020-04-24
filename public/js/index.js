import '@babel/polyfill';
import { login, logout } from './login';
import { mapBox } from './mapbox';
import { updateUser } from './updateUser';

// DOM
const formLogin = document.querySelector('.form-login');
const formUserData = document.querySelector('.form-user-data');
const formUserPassword = document.querySelector('.form-user-password');
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

// UPDATE USERS :: NAME & EMAIL
if (formUserData) {
  formUserData.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;

    console.log(name, email);

    updateUser(new FormData(formUserData), 'data');
  });
}

// btn--save-password

if (formUserPassword) {
  formUserPassword.addEventListener('submit', function(event) {
    event.preventDefault();

    const currentPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const newPasswordConfirm = document.querySelector('#password-confirm')
      .value;

    updateUser(
      { currentPassword, newPassword, newPasswordConfirm },
      'password'
    );

    document.querySelector('#password-current').textContent = '';
    document.querySelector('#password').textContent = '';
    document.querySelector('#password-confirm').textContent = '';
  });
}
