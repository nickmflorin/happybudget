import { useImperativeHandle, useState, forwardRef, ForwardedRef } from "react";
import { isNil, map } from "lodash";

import { budgeting, util } from "lib";

import { Form, Icon } from "components";
import { Input, PercentInput, Select } from "components/fields";
import { EntityText } from "components/typography";

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

interface MarkupFormProps extends FormProps<MarkupFormValues> {
  readonly availableChildren: (Model.SimpleAccount | Model.SimpleSubAccount)[];
  readonly availableChildrenLoading: boolean;
}

export type IMarkupForm = {
  readonly setUnitState: (unit: Model.MarkupUnitId | null) => void;
};

const MarkupForm = (
  { availableChildren, availableChildrenLoading, ...props }: MarkupFormProps,
  ref: ForwardedRef<IMarkupForm>
) => {
  const [unitState, setUnitState] = useState<Model.MarkupUnitId | null>(
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
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {budgeting.models.MarkupUnits.choices.map((m: Model.MarkupUnit, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name={"rate"}
        label={"Amount"}
        style={unitState !== budgeting.models.MarkupUnits.Percent.id ? { display: "none" } : {}}
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
        style={unitState !== budgeting.models.MarkupUnits.Flat.id ? { display: "none" } : {}}
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
              if (unit === budgeting.models.MarkupUnits.Percent.id && (isNil(value) || value.length === 0)) {
                return Promise.reject("At least one account must be selected.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Select
          suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
          showArrow
          loading={availableChildrenLoading}
          mode={"multiple"}
          disabled={availableChildrenLoading || unitState !== budgeting.models.MarkupUnits.Percent.id}
        >
          {map(availableChildren, (obj: Model.SimpleAccount | Model.SimpleSubAccount, index: number) => {
            return (
              <Select.Option key={index + 1} value={obj.id}>
                <EntityText fillEmpty={"----"}>{obj}</EntityText>
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    </Form.Form>
  );
};

export default forwardRef(MarkupForm);
