import React from "react";
import classNames from "classnames";
import moment from "moment";

import * as api from "api";
import { ui, integrations, http } from "lib";

import { Modal } from "components";
import { ImportActualsPlaidForm } from "components/forms";
import { ImportActualsPlaidFormValues } from "components/forms/ImportActualsPlaidForm";

type ImportActualsPlaidModalProps = Omit<ModalProps, "title" | "onOk"> & {
  readonly budgetId: number;
  readonly publicToken: string;
  readonly onSuccess: (budget: Model.Budget, actuals: Model.Actual[]) => void;
};

const ImportActualsPlaidModal = ({ budgetId, onSuccess, ...props }: ImportActualsPlaidModalProps): JSX.Element => {
  const form = ui.useForm<ImportActualsPlaidFormValues>();
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
            const start_date = moment(values.start_date.toISOString()).format("YYYY-MM-DD");
            let end_date: string | null = null;
            if (values.end_date) {
              end_date = moment(values.end_date.toISOString()).format("YYYY-MM-DD");
            }
            api
              .bulkImportActuals(
                budgetId,
                {
                  start_date: start_date,
                  end_date: end_date,
                  public_token: props.publicToken,
                  source: integrations.models.ActualImportSourceModels.PLAID.id
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
