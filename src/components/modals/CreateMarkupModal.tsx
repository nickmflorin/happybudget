import { useEffect, useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { ui, budgeting } from "lib";
import { MarkupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateMarkupModalProps<
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
> extends Omit<CreateModelModalProps<Model.Markup, R>, "children"> {
  readonly id: number;
  readonly children?: number[];
  readonly parentType: Model.ParentType;
}

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

const CreateMarkupModal = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>({
  id,
  parentType,
  children,
  ...props
}: CreateMarkupModalProps<B, R>): JSX.Element => {
  const form = ui.hooks.useForm<MarkupFormValues>();
  const [cancelToken] = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<M[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<M>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<M>) => {
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
    <CreateModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, R>
      {...props}
      title={"Markup"}
      titleIcon={"badge-percent"}
      form={form}
      create={(payload: Http.MarkupPayload, options?: Http.RequestOptions) =>
        api.createTableMarkup(id, parentType, payload, options)
      }
      interceptPayload={(p: MarkupFormValues) => {
        const { rate, children: markupChildren, ...payload } = p;
        let mutated = { ...payload } as Http.MarkupPayload;
        // FLAT Markups do not have any children.
        if (mutated.unit === budgeting.models.MarkupUnitModels.PERCENT.id) {
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
              ? { unit: budgeting.models.MarkupUnitModels.FLAT.id }
              : { unit: budgeting.models.MarkupUnitModels.PERCENT.id }
          }
        />
      )}
    </CreateModelModal>
  );
};

export default CreateMarkupModal;
