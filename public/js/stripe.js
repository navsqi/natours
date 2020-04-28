import axios from 'axios';
import { showAlert } from './alert';

let stripe = Stripe('pk_test_uCnNZoRgP23bDfqNm4tzc6op00vdQy9m7X');

export async function bookTour(tourId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`
    });

    stripe
      .redirectToCheckout({
        // Make the id field from the Checkout Session creation API response
        // available to this file, so you can provide it as parameter here
        // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
        sessionId: response.data.session.id
      })
      .then(function(result) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
      });
  } catch (err) {
    showAlert('error', err);
  }
}
