import { useHistory } from "react-router-dom";
import classNames from "classnames";

import { Modal } from "components";
import { PrimaryButton } from "components/buttons";

function MultipleBudgetProductPermissionModal(props: Omit<ModalProps, "title" | "footer">): JSX.Element {
  const history = useHistory();

  return (
    <Modal
      {...props}
      footer={null}
      className={classNames("multiple-budget-product-pemrission-modal", props.className)}
      title={"You've Reached the Free Tier Limit"}
    >
      <p className={"modal-text"}>{"Not to worry! You can upgrade your plan here."}</p>
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "row", marginTop: 18 }}>
        <PrimaryButton
          onClick={() => {
            props.onCancel?.();
            history.push("/billing");
          }}
          style={{ maxWidth: 220 }}
        >
          {"Subscribe"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

export default MultipleBudgetProductPermissionModal;
