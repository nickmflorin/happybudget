import classNames from "classnames";

import * as ui from "lib/ui";

export type FieldHelpTextProps = ui.ComponentProps<{
  readonly children: string;
}>;

export const FieldHelpText = ({ children, ...props }: FieldHelpTextProps): JSX.Element => (
  <div {...props} className={classNames("field__help-text", props.className)}>
    {children}
  </div>
);
