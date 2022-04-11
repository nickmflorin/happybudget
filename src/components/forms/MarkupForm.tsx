import { useImperativeHandle, useState, forwardRef, ForwardedRef } from "react";
import { isNil } from "lodash";

import { model, util } from "lib";

import { Form } from "components";
import { ChildrenSelect, Input, PercentInput, MarkupUnitSelect } from "components/fields";

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

type MarkupFormProps<PARENT extends Model.Account | Model.SubAccount> = FormProps<MarkupFormValues> & {
  readonly parentId: PARENT["id"];
  readonly parentType: PARENT["type"] | "budget";
};

export type IMarkupForm = {
  readonly setUnitState: (unit: Model.MarkupUnit["id"] | null) => void;
};

const MarkupForm = <
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  PARENT extends Model.Account | Model.SubAccount
>(
  { parentType, parentId, ...props }: MarkupFormProps<PARENT>,
  ref: ForwardedRef<IMarkupForm>
) => {
  const [unitState, setUnitState] = useState<Model.MarkupUnit["id"] | null>(
    props.initialValues?.unit === undefined ? null : props.initialValues?.unit
  );

  useImperativeHandle(ref, () => ({
    setUnitState
  }));

  return (
    <Form.Form
      layout={"vertical"}
      {...props}
      onValuesChange={(changedValues: Partial<MarkupFormValues>, values: MarkupFormValues) => {
        if (!isNil(changedValues.unit)) {
          setUnitState(changedValues.unit);
        }
        props.onValuesChange?.(changedValues, values);
      }}
    >
      <Form.Item name={"description"} label={"Description"}>
        <Input />
      </Form.Item>

      <Form.Item name={"unit"} label={"Type"} rules={[{ required: true, message: "Please select a type." }]}>
        <MarkupUnitSelect />
      </Form.Item>

      <Form.Item
        name={"rate"}
        label={"Amount"}
        style={unitState !== model.budgeting.MarkupUnits.percent.id ? { display: "none" } : {}}
        rules={[
          { required: false },
          () => ({
            validator(rule: unknown, value: string) {
              if (value !== "" && !isNil(value) && !util.validate.validateNumeric(value)) {
                return Promise.reject("Please enter a valid number.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <PercentInput />
      </Form.Item>
      <Form.Item
        name={"rate"}
        label={"Amount"}
        style={unitState !== model.budgeting.MarkupUnits.flat.id ? { display: "none" } : {}}
        rules={[
          { required: false },
          () => ({
            validator(rule: unknown, value: string) {
              if (value !== "" && !isNil(value) && !util.validate.validateNumeric(value)) {
                return Promise.reject("Please enter a valid number.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name={"identifier"} label={"Account #"}>
        <Input />
      </Form.Item>
      <Form.Item
        name={"children"}
        label={"Include Accounts"}
        rules={[
          { required: false },
          ({ getFieldValue }: { getFieldValue: (field: string) => number }) => ({
            validator(rule: unknown, value: number[]) {
              /* If the unit is FLAT, we do not allow children - but we have to
								 just filter those out in the payload before the API request as
								 doing that validation here will prevent the form from submitting
								 in the FLAT state. */
              const unit = getFieldValue("unit");
              if (unit === model.budgeting.MarkupUnits.percent.id && (isNil(value) || value.length === 0)) {
                return Promise.reject("At least one account must be selected.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <ChildrenSelect<MM>
          parentType={parentType}
          parentId={parentId}
          isDisabled={unitState !== model.budgeting.MarkupUnits.percent.id}
        />
      </Form.Item>
    </Form.Form>
  );
};

type MarkupFormType = <
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  PARENT extends Model.Account | Model.SubAccount
>(
  props: MarkupFormProps<PARENT> & { readonly ref?: ForwardedRef<IMarkupForm> }
) => JSX.Element;

export default forwardRef(MarkupForm) as MarkupFormType;
