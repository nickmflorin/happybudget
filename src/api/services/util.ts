import urljoin from "url-join";
import { map } from "lodash";

export const URL = {
  v1: (...args: (string | number)[]) => {
    return urljoin("v1", ...map(args, (arg: string | number) => String(arg)), "/");
  }
};
