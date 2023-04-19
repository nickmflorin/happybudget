import React from "react";

import classNames from "classnames";

import { ui, notifications } from "lib";
import { Modal } from "components";
import { Previewer, PreviewerProps } from "deprecated/components/pdf";

interface PreviewModalProps
  extends Omit<PreviewerProps, "onRenderError">,
    StandardComponentProps,
    Pick<ModalProps, "onCancel" | "open" | "modal"> {
  readonly children: JSX.Element;
}

const PreviewModal = ({
  className,
  style,
  open,
  onCancel,
  children,
  ...props
}: PreviewModalProps): JSX.Element => {
  const modal = ui.useModalIfNotDefined(props.modal);

  return (
    <Modal
      className={classNames("export-preview-modal", className)}
      style={style}
      title="Export"
      open={open}
      onCancel={onCancel}
      modal={modal}
      footer={null}
    >
      <div className="export-form-container">{children}</div>
      <Previewer
        {...props}
        onRenderError={(e: Error) => {
          notifications.internal.notify({
            error: e,
            level: "error",
            dispatchToSentry: true,
          });
          modal.current.notify({
            message: "There was a problem rendering your document.",
            level: "error",
          });
        }}
      />
    </Modal>
  );
};

export default React.memo(PreviewModal);
