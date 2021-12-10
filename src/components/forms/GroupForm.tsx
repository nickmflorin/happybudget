import { useEffect } from "react";
import { isNil, map } from "lodash";

import * as api from "api";

import { Form, Icon } from "components";
import { Input, Select, ColorSelect } from "components/fields";
import { EntityText } from "components/typography";

interface GroupFormProps<M extends Model.SimpleAccount | Model.SimpleSubAccount> extends FormProps<Http.GroupPayload> {
  readonly availableChildren: M[];
  readonly availableChildrenLoading: boolean;
}

const GroupForm = <M extends Model.SimpleAccount | Model.SimpleSubAccount>({
  availableChildren,
  availableChildrenLoading,
  ...props
}: GroupFormProps<M>): JSX.Element => {
  const [colors, loading, error] = api.useGroupColors();

  useEffect(() => {
    props.form.setLoading(loading);
  }, [loading]);

  useEffect(() => {
    // TODO: This can lead to an error being stuck on the modal - we should fix.
    if (!isNil(error)) {
      props.form.handleRequestError(error);
    }
  }, [error]);

  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the group." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item name={"color"} label={"Color"}>
        <ColorSelect colors={colors} />
      </Form.Item>
      <Form.Item
        name={"children"}
        label={"Subtotal Accounts"}
        rules={[
          { required: false },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value.length === 0) {
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

export default GroupForm;
