import React from "react";
import classNames from "classnames";

import * as api from "api";
import { ui } from "lib";

import { Modal } from "components";
import { ImportActualsPlaidForm } from "components/forms";
import { ImportActualsPlaidFormValues } from "components/forms/ImportActualsPlaidForm";

type ImportActualsPlaidModalProps = Omit<ModalProps, "title" | "onOk"> & {
  readonly budgetId: number;
  readonly publicToken: string;
  readonly onSuccess: (budget: Model.Budget, actuals: Model.Actual[]) => void;
};

const ImportActualsPlaidModal = ({ budgetId, onSuccess, ...props }: ImportActualsPlaidModalProps): JSX.Element => {
  const form = ui.hooks.useForm<ImportActualsPlaidFormValues>();
  const [cancelToken] = api.useCancelToken();

  return (
    // TODO: Fix DatePicker getting cut off by modal bounds
    <div id="import-actuals-modal">
      <Modal
        {...props}
        style={{ overflowY: "visible" }}
        bodyStyle={{ overflowY: "visible" }}
        className={classNames("import-actuals-plaid-modal", props.className)}
        title={"Import Actuals"}
        onOk={() => {
          form
            .validateFields()
            .then((values: ImportActualsPlaidFormValues) => {
              form.setLoading(true);
              api
                .bulkImportActuals(
                  budgetId,
                  // 0 is the id number for Plaid in ActualImportSource
                  { ...values, public_token: props.publicToken, source: 0 },
                  { cancelToken: cancelToken() }
                )
                .then((response: Http.ParentChildListResponse<Model.Budget, Model.Actual>) => {
                  form.setLoading(false);
                  onSuccess(response.parent, response.children);
                })
                .catch((e: Error) => {
                  form.setLoading(false);
                  form.handleRequestError(e);
                });
            })
            .catch(() => {
              return;
            });
        }}
      >
        <ImportActualsPlaidForm form={form} />
      </Modal>
    </div>
  );
};

export default React.memo(ImportActualsPlaidModal);
