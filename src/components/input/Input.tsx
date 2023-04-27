import React from "react";

import classNames from "classnames";

import * as ui from "lib/ui";
import { forms } from "lib/ui";

export type InputProps = ui.ComponentProps<
  {
    readonly input?: forms.InputRef<HTMLInputElement>;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  },
  {
    external: Pick<
      ui.HTMLElementProps<"input">,
      "disabled" | "placeholder" | "value" | "onBlur" | "onFocus" | "onChange" | "name"
    >;
  }
>;

export const Input = ({ input, ...props }: InputProps): JSX.Element => (
  <input
    type="text"
    {...props}
    ref={input}
    className={classNames("native-input", props.className)}
  />
);
