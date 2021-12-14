import { useEffect } from "react";
import { registerFonts } from "style/pdf";
import classNames from "classnames";

import { Modal } from "components";
import { Previewer, PreviewerProps } from "components/pdf";

import "./PreviewModal.scss";

interface PreviewModalProps extends PreviewerProps, StandardComponentProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly visible: boolean;
  readonly children: JSX.Element;
}

const PreviewModal = ({
  className,
  style,
  visible,
  onSuccess,
  onCancel,
  children,
  ...props
}: PreviewModalProps): JSX.Element => {
  useEffect(() => {
    const register = async () => await registerFonts();
    if (visible === true) {
      register();
    }
  }, [visible]);

  return (
    <Modal
      className={classNames("export-preview-modal", className)}
      style={style}
      title={"Export"}
      visible={visible}
      onCancel={() => onCancel()}
      getContainer={false}
      footer={null}
    >
      <div className={"export-form-container"}>{children}</div>
      <Previewer {...props} />
    </Modal>
  );
};

export default PreviewModal;
