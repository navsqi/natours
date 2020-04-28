import axios from 'axios';
import { showAlert } from './alert';

export async function login(email, password) {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Log in is success');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export async function logout() {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (response.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! please try again');
  }
}
