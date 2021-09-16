import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { model } from "lib";

import { Form } from "components";
import { BudgetForm } from "components/forms";
import { Modal } from "./generic";

interface EditBudgetModalProps {
  budget: Model.Budget;
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
}

const EditBudgetModal = ({ open, budget, onSuccess, onCancel }: EditBudgetModalProps): JSX.Element => {
  const [file, setFile] = useState<UploadedImage | SavedImage | null>(budget.image);
  const [form] = Form.useForm<Http.BudgetPayload>({ isInModal: true });
  const cancelToken = api.useCancelToken();

  return (
    <Modal
      title={`Edit ${budget.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            form.setLoading(true);
            let payload: Http.BudgetPayload = { ...values };
            /*
            There are (3) possible scenarios here:

            (1) `file` is `UploadedImage` & we have access to `file.data`
                  This will be the case if the user uploads an image for the first time
                  or changes the already uploaded image.
            (2) `file` is `SavedImage` & we don't have access to `file.data`
                  This will be the case if the budget already had an image and it was not
                  changed.  Since we don't have access to `file.data` in this case, since the
                  image is already in S3, we do  not need to include it in the payload since it has
                  not changed.
            (3) `file` is null
                  This will be the case if either the budget did not have an image to begin
                  with and an image was not uploaded, or the budget had an image to begin with
                  and the image was cleared.  Unfortunately, there isn't a very "clean" way
                  to determine which case this was (a way that doesn't involve adding extra state
                  to this component).  Fortunately though, it doesn't matter...

                  For the second case, we need to include the null value in the payload to clear the
                  image in the backend.  For the first case, including null in the payload will not
                  have an affect, since it was already null to begin with.  So we can treat these
                  two cases as the same.

              Note that if we did not initialize the `file` state variable as `budget.image`, we would
              not be able to differentiate between Scenario (1) and Scenario (2).
            */
            if (isNil(file) || model.typeguards.isUploadedImage(file)) {
              payload = { ...payload, image: !isNil(file) ? file.data : null };
            }
            api
              .updateBudget(budget.id, payload, { cancelToken: cancelToken() })
              .then((newBudget: Model.Budget) => {
                form.resetFields();
                onSuccess(newBudget);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <BudgetForm
        form={form}
        onImageChange={(f: UploadedImage | null) => setFile(f)}
        originalImage={budget.image}
        initialValues={{ name: budget.name }}
      />
    </Modal>
  );
};

export default EditBudgetModal;
