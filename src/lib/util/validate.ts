import { isNil, uniq } from "lodash";

const getPasswordValidationState = (value: string): PasswordValidationState => {
  const lowercase = /[a-z|ç|ş|ö|ü|ı|ğ]/.test(value);
  const uppercase = /[A-Z|Ç|Ş|Ö|Ü|İ|Ğ]/.test(value);
  const number = /[0-9]/.test(value);
  const character = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
  const minChar = value.length >= 8;
  return { lowercase, uppercase, number, character, minChar };
};

export const validatePassword = (value: string): boolean => {
  if (isNil(value) || value === "") {
    return false;
  }
  const state = getPasswordValidationState(value);
  return uniq(Object.values(state)).length === 1 && Object.values(state)[0] === true;
};

export const validateEmail = (email?: string): boolean => {
  if (isNil(email) || email === "") {
    return false;
  }
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateSlug = (slug: string) => {
  if (slug === "") {
    return false;
  }
  const re = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
  return re.test(String(slug));
};
