import { isNil } from "lodash";

export const validatePassword = (password?: string): boolean => {
  if (isNil(password) || password === "") {
    return false;
  }
  const re = /(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}/;
  // TODO: Add a constants/configuration file with the minimum password length.
  return re.test(password) && password.length >= 8;
};

export const validateEmail = (email?: string): boolean => {
  if (isNil(email) || email === "") {
    return false;
  }
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateSlug = (slug: string) => {
  if (slug === "") {
    return false;
  }
  const re = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
  return re.test(String(slug));
};
