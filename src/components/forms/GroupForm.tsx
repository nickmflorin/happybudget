import { useEffect } from "react";
import { isNil } from "lodash";

import { model } from "lib";

import { Form } from "components";
import { Input, ColorSelect, ChildrenSelect } from "components/fields";

interface GroupFormProps extends FormProps<Http.GroupPayload> {
  readonly parentId: number;
  readonly parentType: Model.ParentType;
}

const GroupForm = <MM extends Model.SimpleAccount | Model.SimpleSubAccount>({
  parentType,
  parentId,
  ...props
}: GroupFormProps): JSX.Element => {
  const [colors, loading, error] = model.budgeting.useGroupColors();

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
        <ColorSelect colors={colors} useDefault={true} colorSize={20} selectable={true} treatDefaultAsNull={true} />
      </Form.Item>
      <Form.Item
        name={"children"}
        label={"Subtotal Accounts"}
        rules={[
          { required: false },
          () => ({
            validator(rule: unknown, value: string) {
              if (value.length === 0) {
                return Promise.reject("At least one account must be selected.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <ChildrenSelect<MM> parentType={parentType} parentId={parentId} />
      </Form.Item>
    </Form.Form>
  );
};

export default GroupForm;
