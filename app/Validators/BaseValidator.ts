// import { CustomMessages } from '@ioc:Adonis/Core/Validator'
export default class BaseValidator {
  public messages = {
    minLength: '{{ field }} must be at least {{ options.minLength }} characters long',
    maxLength: '{{ field }} cannot be longer than {{ options.maxLength }} characers long',
    range: 'The range provided is invalid',
    //unique: '{{ field }}',
    format: '{{ field }} must be formatted as {{ options.format }}',
    unique: '{{ field }} is not available'

  }
}
