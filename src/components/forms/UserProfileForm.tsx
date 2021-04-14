import { useState } from "react";
import { isNil } from "lodash";

import { Input, Button } from "antd";

import { Form } from "components";
import { FormProps, FormInstance } from "components/Form";
import UploadProfileImage from "./UploadProfileImage";

interface UserProfileFormProps extends FormProps<Http.UserPayload> {
  form: FormInstance<Http.UserPayload>;
  onSubmit: (payload: Partial<Http.UserPayload>) => void;
  onUploadError: (error: string) => void;
}

const UserProfileForm = ({
  form,
  initialValues,
  globalError,
  onSubmit,
  onUploadError
}: UserProfileFormProps): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);

  return (
    <Form.Form
      form={form}
      globalError={globalError}
      layout={"vertical"}
      name={"form_in_modal"}
      initialValues={initialValues}
      onFinish={(values: Partial<Http.UserPayload>) => onSubmit({ ...values, profile_image: file })}
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
        <UploadProfileImage
          initialValue={!isNil(initialValues) ? initialValues.profile_image : undefined}
          onChange={(f: File | Blob) => setFile(f)}
          onError={onUploadError}
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
