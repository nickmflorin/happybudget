import React from "react";
import classNames from "classnames";
import { ui } from "lib";

import { Icon } from "components";

interface FormTitleProps extends StandardComponentProps {
  readonly icon: IconOrElement;
  readonly title: string;
}

const FormTitle = ({ icon, title, ...props }: FormTitleProps): JSX.Element => (
  <div {...props} className={classNames("form-title", props.className)}>
    {ui.iconIsJSX(icon) ? icon : <Icon icon={icon} weight={"regular"} />}
    {title}
  </div>
);

export default React.memo(FormTitle);
