import { useState, useMemo } from "react";

import { cookies } from "lib";

import { ConfirmationModal } from "components/modals";
import { ConfirmationProps } from "components/notifications";
import { isNil } from "lodash";

type UseConfirmationProps = Pick<ConfirmationProps, "suppressionKey"> & {
  readonly detail: string;
  readonly message?: string;
  readonly okText?: string;
  readonly cancelText?: string;
  readonly okButtonClass?: string;
  readonly onConfirmed: () => void;
};

const useConfirmation = (props: UseConfirmationProps): [JSX.Element, () => void] => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const modal = useMemo(() => {
    const msg = !isNil(message) ? message : !isNil(props.message) ? props.message : "";
    if (visible) {
      return (
        <ConfirmationModal
          okText={props.okText}
          cancelText={props.cancelText}
          okButtonClass={props.okButtonClass}
          message={msg}
          suppressionKey={props.suppressionKey}
          onOk={() => {
            setVisible(false);
            setMessage(null);
            props.onConfirmed();
          }}
          onCancel={() => {
            setMessage(null);
            setVisible(false);
          }}
        >
          {props.detail}
        </ConfirmationModal>
      );
    }
    return <></>;
  }, [props.message, message, props.suppressionKey, props.detail, visible, props.onConfirmed]);

  const confirm = useMemo(
    () => (m?: string) => {
      if (cookies.confirmationIsSuppressed(props.suppressionKey)) {
        props.onConfirmed();
      } else {
        if (!isNil(m)) {
          setMessage(m);
        }
        setVisible(true);
      }
    },
    [props.onConfirmed]
  );

  return [modal, confirm];
};

export default useConfirmation;
