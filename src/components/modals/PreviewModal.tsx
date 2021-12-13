import { useEffect } from "react";
import { registerFonts } from "style/pdf";

import { Modal } from "components";
import { Previewer, PreviewerProps } from "components/pdf";

import "./PreviewModal.scss";

interface PreviewModalProps extends PreviewerProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly visible: boolean;
  readonly children: JSX.Element;
}

const PreviewModal = ({ visible, onSuccess, onCancel, children, ...props }: PreviewModalProps): JSX.Element => {
  useEffect(() => {
    const register = async () => await registerFonts();
    if (visible === true) {
      register();
    }
  }, [visible]);

  return (
    <Modal
      className={"export-preview-modal"}
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
