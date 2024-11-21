import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { VALID_CURRENCIES } from '../constants/currency.constants';

@ValidatorConstraint({ name: 'isCurrency', async: false })
export class IsCurrencyConstraint implements ValidatorConstraintInterface {
  validate(currency: string) {
    return VALID_CURRENCIES.includes(currency as any);
  }

  defaultMessage() {
    return `Currency must be one of: ${VALID_CURRENCIES.join(', ')}`;
  }
}

export function IsCurrency(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCurrencyConstraint,
    });
  };
}
