import { useHistory } from "react-router-dom";
import classNames from "classnames";

import { Modal } from "components";
import { PrimaryButton } from "components/buttons";

function SubscriptionPermissionModal(props: Omit<ModalProps, "title" | "footer">): JSX.Element {
  const history = useHistory();

  return (
    <Modal
      {...props}
      footer={null}
      className={classNames("subscription-pemrission-modal", props.className)}
      title={"Subscription"}
    >
      <p>{"You need to subscribe in order to create multiple budgets."}</p>
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "row", marginTop: 12 }}>
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

export default SubscriptionPermissionModal;
