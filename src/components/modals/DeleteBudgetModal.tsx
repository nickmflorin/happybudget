import { Notification } from "components/notifications";
import { DeleteModal } from "./generic";

interface DeleteBudgetModalProps extends ModalProps {
  readonly budget: Model.Budget;
}

function DeleteBudgetModal({ budget, ...props }: DeleteBudgetModalProps): JSX.Element {
  return (
    <DeleteModal {...props} title={"Delete Budget"}>
      <Notification level={"warning"} message={`You are about to delete your ${budget?.name} budget.`}>
        {"This action is not recoverable, the data will be permanently erased."}
      </Notification>
    </DeleteModal>
  );
}

export default DeleteBudgetModal;
