import { useState } from "react";
import { isNil } from "lodash";

import { Input, Button } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";
import UploadUserImage from "./UploadUserImage";

const UserProfileForm = ({ ...props }: FormProps<Http.UserPayload>): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);

  return (
    <Form.Form
      name={"form_in_modal"}
      onFinish={(values: Partial<Http.UserPayload>) =>
        !isNil(props.onFinish) && props.onFinish({ ...values, profile_image: file })
      }
      {...props}
    >
      <Form.Item
        name={"first_name"}
        label={"First Name"}
        rules={[{ required: true, message: "Please provide your first name." }]}
      >
        <Input placeholder={"First Name"} />
      </Form.Item>
      <Form.Item
        name={"last_name"}
        label={"Last Name"}
        rules={[{ required: true, message: "Please provide your last name." }]}
      >
        <Input placeholder={"Last Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"}>
        <UploadUserImage
          initialValue={!isNil(props.initialValues) ? props.initialValues.profile_image : undefined}
          onChange={(f: File | Blob) => setFile(f)}
          onError={(error: string) => props.form.setGlobalError(error)}
        />
      </Form.Item>
      <Form.Item>
        <Button className={"btn--primary"} htmlType={"submit"} style={{ width: "100%" }}>
          {"Save"}
        </Button>
      </Form.Item>
    </Form.Form>
  );
};

export default UserProfileForm;
