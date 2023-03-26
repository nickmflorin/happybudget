import { isNil } from "lodash";
import Cookies from "universal-cookie";

import * as config from "application/config";

// TODO: USE ENV VARIABLE
export const getRequestHeaders = (): { [key: string]: string } => {
  const headers: { [key: string]: string } = {};
  const cookies = new Cookies();
  /* The CSRF Token needs to be set as a header for POST/PATCH/PUT requests
     with Django - unfortunately, we cannot include it as a cookie only
     because their middleware looks for it in the headers. */
  let csrfToken: string = cookies.get("happybudgetcsrftoken");
  if (config.env.environmentIsLocal()) {
    csrfToken = cookies.get("localhappybudgetcsrftoken");
  }
  if (!isNil(csrfToken)) {
    headers["X-CSRFToken"] = csrfToken;
  }
  return headers;
};

export const setRequestHeaders = (request: XMLHttpRequest) => {
  const headers = getRequestHeaders();
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    request.setRequestHeader(keys[i], headers[keys[i]]);
  }
};

export const filterPayload = <T extends Http.PayloadObj = Http.PayloadObj>(payload: T): T => {
  const newPayload: T = {} as T;
  Object.keys(payload).forEach((key: string) => {
    if (typeof payload === "object" && payload[key as keyof T] !== undefined) {
      newPayload[key as keyof T] = payload[key as keyof T];
    }
  });
  return newPayload;
};
