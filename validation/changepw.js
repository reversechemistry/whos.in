import Validator from 'validator';
import isEmpty from './is-empty.js';

export default function validateChangpwInput(data) {
  let errors = {};

  if (!Validator.isEmail(data.email)){
    errors.email = ' Email is invalid';
  }

  if (isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isLength(data.newPassword, { min: 6, max: 30 })) {
    errors.password = "New Password must be between 6 and 30 characters";
  }
   
  if (isEmpty(data.newPassword)) {
    errors.password = "New Password field is required";
  }
  
  if (isEmpty(data.newPassword2)) {
    errors.newPassword2 = "Confirm New Password field is required";
  }

  if (!Validator.equals(data.newPassword, data.newPassword2)) {
    errors.newPassword2 = 'New Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}