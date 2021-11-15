import { Notification } from "components/feedback";
import { DeleteModal, DeleteModalProps } from "./generic";

interface DeleteBudgetModalProps extends DeleteModalProps {
  readonly budget: Model.Budget;
}

function DeleteBudgetModal({ budget, ...props }: DeleteBudgetModalProps): JSX.Element {
  return (
    <DeleteModal {...props} title={"Delete Budget"}>
      <Notification type={"warning"} title={`You are about to delete your ${budget?.name} budget.`}>
        {"This action is not recoverable, the data will be permanently erased."}
      </Notification>
    </DeleteModal>
  );
}

export default DeleteBudgetModal;
