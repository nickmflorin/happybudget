import { uniq } from "lodash";

export type Validator<T> = (value: T) => boolean;

/**
 * Returns whether or not all of the provided values {@link Array<T>} evaluate to a Boolean true.
 */
export const all = <T extends string | number | boolean>(values: T[]): boolean =>
  !values.map((v: string | number | boolean) => Boolean(v)).includes(false);

/**
 * Returns whether or not any of the provided values {@link Array<T>} evaluate to a Boolean true.
 */
export const any = <T extends string | number | boolean>(values: T[]): boolean =>
  values.map((v: string | number | boolean) => Boolean(v)).includes(true);

/**
 * Returns whether or not the provided value {@link T} meets all of the given criteria, which are
 * either defined as a validator {@link Validator<T>} or an array of validators
 * {@link Array<Validator<T>>}.
 */
export const validate = <T>(value: T, criteria: Validator<T> | Validator<T>[]): boolean =>
  all((Array.isArray(criteria) ? criteria : [criteria]).map((v: Validator<T>) => v(value)));

/**
 * Returns whether or not all of the provided values {@link Array<T>} meets all of the given
 * criteria, which are either defined as a validator {@link Validator<T>} or an array of validators
 * {@link Array<Validator<T>>}.
 */
export const validateAll = <T>(values: T[], criteria: Validator<T> | Validator<T>[]): boolean =>
  all(values.map((v: T) => validate(v, criteria)));

/**
 * Returns whether or not any of the provided values {@link Array<T>} meet all of the given
 * criteria, which are either defined as a validator {@link Validator<T>} or an array of validators
 * {@link Array<Validator<T>>}.
 */
export const validateAny = <T>(values: T[], criteria: Validator<T> | Validator<T>[]): boolean =>
  any(values.map((v: T) => validate(v, criteria)));

const getPasswordValidationState = (value: string): PasswordValidationState => {
  const lowercase = /[a-z]/.test(value);
  const uppercase = /[A-Z]/.test(value);
  const number = /[0-9]/.test(value);
  const character = /[\W|_/g]/.test(value);
  const minChar = value.length >= 8;
  return { lowercase, uppercase, number, character, minChar };
};

export type PasswordValidationID = "lowercase" | "uppercase" | "number" | "character" | "minChar";
export type PasswordValidationName = { id: PasswordValidationID; name: string };
export type PasswordValidationState = { [key in PasswordValidationID]: boolean };

/**
 * Convert to ZOD Schema
 * @deprecated
 */
export const validatePassword = (value: string): boolean => {
  if (value === "") {
    return false;
  }
  const state = getPasswordValidationState(value);
  return uniq(Object.values(state)).length === 1 && Object.values(state)[0] === true;
};

/**
 * Convert to ZOD Schema
 * @deprecated
 */
export const validateSlug = (slug: string) => {
  if (slug === "") {
    return false;
  }
  const re = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
  return re.test(String(slug));
};
