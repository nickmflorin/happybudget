import { ReactNode } from "react";
import classNames from "classnames";

interface ModalTitleProps extends StandardComponentProps {
  readonly children: ReactNode;
}

const ModalTitle = (props: ModalTitleProps): JSX.Element => {
  return (
    <div {...props} className={classNames("ant-modal-title", "modal-title", props.className)}>
      {props.children}
    </div>
  );
};

export default ModalTitle;
