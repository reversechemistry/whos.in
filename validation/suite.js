const isEmpty = require('./is-empty');

module.exports = function validateSuiteInput(data){
  let errors = {};

  if(isEmpty(data.suitename)){
    errors.suitename = "Suite name field is required"
  }

  return {
    errors,
    isValid: isEmpty(errors),
  }
}