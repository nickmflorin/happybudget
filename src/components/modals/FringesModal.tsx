import React from "react";
import { Modal } from "components";

const FringesModal = (props: ModalProps & { readonly children: JSX.Element }): JSX.Element => (
  <Modal className={"fringes-modal"} title={"Fringes"} {...props} footer={null}>
    {props.children}
  </Modal>
);

export default React.memo(FringesModal);
