import axios from 'axios';
import { showAlert } from './alert';

export async function updateUser(data, type) {
  const url =
    type == 'password'
      ? 'http://localhost:3000/api/v1/users/updatePassword'
      : 'http://localhost:3000/api/v1/users/updateMe';

  try {
    const response = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (response.data.status === 'success') {
      showAlert(
        'success',
        `${type.toUpperCase()} has been updated successfully`
      );

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}
