import { useState, useMemo } from "react";

import { cookies } from "lib";

import { ConfirmationModal } from "components/modals";
import { ConfirmationProps } from "components/notifications";
import { isNil } from "lodash";

type UseConfirmationProps<ARGS extends Array<unknown>> = Pick<ConfirmationProps, "suppressionKey"> & {
  readonly detail: string;
  readonly message?: string;
  readonly okText?: string;
  readonly cancelText?: string;
  readonly okButtonClass?: string;
  readonly title?: string;
  readonly onConfirmed: (...args: ARGS) => void;
};

const useConfirmation = <ARGS extends Array<unknown>>(
  props: UseConfirmationProps<ARGS>
): [JSX.Element, (passThrough: ARGS, m?: string) => void] => {
  const [modal, setModal] = useState<JSX.Element | null>(null);

  const _setModal = useMemo(
    () => (passThrough: ARGS, m?: string) => {
      const msg = !isNil(m) ? m : !isNil(props.message) ? props.message : "";
      const mdl = (
        <ConfirmationModal
          open={true}
          okText={props.okText}
          cancelText={props.cancelText}
          title={props.title}
          okButtonClass={props.okButtonClass}
          message={msg}
          suppressionKey={props.suppressionKey}
          onOk={() => {
            setModal(null);
            props.onConfirmed(...passThrough);
          }}
          onCancel={() => setModal(null)}
        >
          {props.detail}
        </ConfirmationModal>
      );
      setModal(mdl);
    },
    [props.message, props.cancelText, props.okText, props.okButtonClass, props.suppressionKey, props.title]
  );

  const confirm = useMemo(
    () => (passThrough: ARGS, m?: string) => {
      if (cookies.confirmationIsSuppressed(props.suppressionKey)) {
        props.onConfirmed(...passThrough);
      } else {
        _setModal(passThrough, m);
      }
    },
    [props.onConfirmed, props.suppressionKey]
  );

  return [modal || <></>, confirm];
};

export default useConfirmation;
