import { useEffect, useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { ui, model, http } from "lib";
import { MarkupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps, CreateModelCallbacks } from "./generic";

interface CreateMarkupModalProps<
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>
> extends Omit<CreateModelModalProps<Model.Markup, RSP>, "children"> {
  readonly id: PARENT["id"];
  readonly children?: number[];
  readonly table: Table.TableInstance<R, M>;
  readonly parentType: PARENT["type"] | "budget";
}

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

const CreateMarkupModal = <
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>
>({
  id,
  parentType,
  children,
  table,
  ...props
}: CreateMarkupModalProps<B, PARENT, R, M, RSP>): JSX.Element => {
  const form = ui.useForm<MarkupFormValues>();
  const [cancelToken] = http.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<MM[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<MM>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<MM>) => {
        setAvailableChildren(response.data);
        /* Wait until the available children are set in the Form so the select
					 doesn't render selected children with missing labels. */
        if (!isNil(children)) {
          form.setFields([{ name: "children", value: children }]);
        }
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [id, children]);

  return (
    <CreateModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, RSP>
      {...props}
      title={"Markup"}
      titleIcon={"badge-percent"}
      form={form}
      createSync={(payload: Http.MarkupPayload, callbacks: CreateModelCallbacks<RSP>) =>
        table.dispatchEvent({ type: "markupAdd", payload, ...callbacks })
      }
      interceptPayload={(p: MarkupFormValues) => {
        const { rate, children: markupChildren, ...payload } = p;
        let mutated = { ...payload } as Http.MarkupPayload;
        // FLAT Markups do not have any children.
        if (mutated.unit === model.budgeting.MarkupUnits.Percent.id) {
          /* The children should not be an empty list as the Form should have
						 already validated that. */
          mutated = { ...mutated, children: markupChildren };
          if (!isNaN(parseFloat(rate))) {
            mutated = {
              ...mutated,
              rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2))
            };
          }
        } else {
          if (!isNaN(parseFloat(rate))) {
            mutated = { ...mutated, rate: parseFloat(parseFloat(rate).toFixed(2)) };
          }
        }
        return mutated;
      }}
    >
      {() => (
        <MarkupForm
          form={form}
          availableChildren={availableChildren}
          availableChildrenLoading={availableChildrenLoading}
          initialValues={
            children === undefined
              ? { unit: model.budgeting.MarkupUnits.Flat.id }
              : { unit: model.budgeting.MarkupUnits.Percent.id }
          }
        />
      )}
    </CreateModelModal>
  );
};

export default CreateMarkupModal;
