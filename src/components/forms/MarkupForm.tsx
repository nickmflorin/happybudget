import { useImperativeHandle, useState, forwardRef, ForwardedRef } from "react";
import { isNil, map } from "lodash";

import { model, util } from "lib";

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
      onValuesChange={(changedValues: any, values: any) => {
        if (!isNil(changedValues.unit)) {
          setUnitState(changedValues.unit);
        }
        props.onValuesChange?.(changedValues, values);
      }}
    >
      <Form.Item name={"identifier"}>
        <Input placeholder={"Account"} />
      </Form.Item>
      <Form.Item name={"description"}>
        <Input placeholder={"Description"} />
      </Form.Item>
      <Form.Item name={"unit"}>
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.MarkupUnits.map((m: Model.MarkupUnit, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={"rate"}
        style={unitState !== model.models.MarkupUnitModels.PERCENT.id ? { display: "none" } : {}}
        rules={[
          { required: false },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value !== "" && !isNil(value) && !util.validate.validateNumeric(value)) {
                return Promise.reject("Please enter a valid number.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <PercentInput placeholder={"Rate"} />
      </Form.Item>
      <Form.Item
        name={"rate"}
        style={unitState !== model.models.MarkupUnitModels.FLAT.id ? { display: "none" } : {}}
        rules={[
          { required: false },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value !== "" && !isNil(value) && !util.validate.validateNumeric(value)) {
                return Promise.reject("Please enter a valid number.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input placeholder={"Rate"} />
      </Form.Item>
      <Form.Item name={"children"}>
        <Select
          suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
          showArrow
          loading={availableChildrenLoading}
          disabled={availableChildrenLoading}
          mode={"multiple"}
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
