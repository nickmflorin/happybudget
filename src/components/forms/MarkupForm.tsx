import React from "react";
import { isNil, map } from "lodash";

import { model, util } from "lib";

import { Form, Icon } from "components";
import { Input, Select } from "components/fields";
import { EntityText } from "components/typography";

interface MarkupFormProps extends FormProps<Http.MarkupPayload> {
  readonly availableChildren: (Model.SimpleAccount | Model.SimpleSubAccount)[];
  readonly availableChildrenLoading: boolean;
}

const MarkupForm: React.FC<MarkupFormProps> = ({ availableChildren, availableChildrenLoading, ...props }) => {
  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"identifier"}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item name={"description"}>
        <Input placeholder={"Description"} />
      </Form.Item>
      <Form.Item
        name={"unit"}
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
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.MarkupUnits.map((m: Model.MarkupUnit, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"rate"}>
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

export default MarkupForm;