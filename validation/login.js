import Validator from 'validator';
import isEmpty from './is-empty.js';

export default function validateLoginInput(data){
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Email is required.";
  }

  if (isEmpty(data.password)) {
    errors.password = "Password field is required."
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};