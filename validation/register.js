import Validator from 'validator';
import isEmpty from './is-empty.js';

export default function validateRegisterInput(data) {
  let errors = {};

  if(!Validator.isLength(data.name, { min: 3 })) {
    errors.name = "Name must be at least 3 characters"
  }

  if (data.email){
    if (!Validator.isEmail(data.email)){
      errors.email = ' Email is invalid';
    }
  }


  if (data.password){
        if(!Validator.isLength(data.password, { min: 6, max: 30 })) {
          errors.password = "Password must be between 6 and 30 characters";
        }
        if (isEmpty(data.password2)) {
          errors.password2 = "Confirm Password field is required";
        }
      
        if (!Validator.equals(data.password, data.password2)) {
          errors.password2 = 'Passwords must match';
        }
      }
    
  

  return {
    errors,
    isValid: isEmpty(errors)
  }
}