import classNames from "classnames";
import { useHistory } from "react-router-dom";

import { Modal } from "components";
import { PrimaryButton } from "components/buttonsOld";

function MultipleBudgetProductPermissionModal(
  props: Omit<ModalProps, "title" | "footer">,
): JSX.Element {
  const history = useHistory();

  return (
    <Modal
      {...props}
      footer={null}
      className={classNames("multiple-budget-product-pemrission-modal", props.className)}
      title={"You've Reached the Free Tier Limit"}
    >
      {/* It is not ideal that we have to hardcode in this promo code - but it is a
			stop-gap until we integrate more stable trialing with Stripe. */}
      <p className="modal-text">
        <span>
          {"The free plan only gives you access to one budget at a time. " +
            "Not to worry, you can either delete the current budget or upgrade " +
            "your plan here for unlimited budgets. Use promo code "}
        </span>
        <span>
          <b>green30</b>
        </span>
        <span>{" for a free 30 day trial."}</span>
      </p>
      <div
        style={{ display: "flex", justifyContent: "center", flexDirection: "row", marginTop: 18 }}
      >
        <PrimaryButton
          onClick={() => {
            props.onCancel?.();
            history.push("/billing");
          }}
          style={{ maxWidth: 220 }}
        >
          Subscribe
        </PrimaryButton>
      </div>
    </Modal>
  );
}

export default MultipleBudgetProductPermissionModal;
