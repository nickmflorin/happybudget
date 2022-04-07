import React from "react";
import classNames from "classnames";
import moment from "moment";

import * as api from "api";
import { ui, model, http } from "lib";

import { Modal } from "components";
import { ImportActualsPlaidForm } from "components/forms";
import { ImportActualsPlaidFormValues } from "components/forms/ImportActualsPlaidForm";

type ImportActualsPlaidModalProps = Omit<ModalProps, "title" | "onOk"> & {
  readonly budgetId: number;
  readonly publicToken: string;
  readonly accountIds?: string[];
  readonly onSuccess: (budget: Model.Budget, actuals: Model.Actual[]) => void;
};

const ImportActualsPlaidModal = ({
  accountIds,
  publicToken,
  budgetId,
  onSuccess,
  ...props
}: ImportActualsPlaidModalProps): JSX.Element => {
  const form = ui.form.useForm<ImportActualsPlaidFormValues>();
  const [cancelToken] = http.useCancelToken();

  return (
    <Modal
      {...props}
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
                {
                  start_date: moment(values.start_date.toISOString()).format("YYYY-MM-DD"),
                  end_date:
                    values.end_date !== null
                      ? moment(values.end_date.toISOString()).format("YYYY-MM-DD")
                      : values.end_date,
                  public_token: publicToken,
                  source: model.budgeting.ActualImportSources.bank_account.id,
                  account_ids: accountIds
                },
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
  );
};

export default React.memo(ImportActualsPlaidModal);
