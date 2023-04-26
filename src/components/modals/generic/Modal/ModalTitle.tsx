import classNames from "classnames";
import { ui } from "lib";

import { Icon } from "components";

interface ModalTitleProps extends StandardComponentProps {
  readonly icon: IconOrElement;
  readonly title: string;
}

const ModalTitle = ({ icon, title, ...props }: ModalTitleProps): JSX.Element => {
  return (
    <div {...props} className={classNames("ant-modal-title", "modal-title", props.className)}>
      {ui.iconIsJSX(icon) ? icon : <Icon icon={icon} weight={"solid"} />}
      {title}
    </div>
  );
};

export default ModalTitle;
