import { useState } from "react";
import { isNil } from "lodash";

import { Input, Button } from "antd";
import { FormInstance } from "antd/lib/form";

import { Form } from "components";
import { FormProps } from "components/Form/model";
import UploadProfileImage from "./UploadProfileImage";

interface UserProfileFormProps extends FormProps {
  form: FormInstance<Http.IUserPayload>;
  onSubmit: (payload: Partial<Http.IUserPayload>) => void;
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
      onFinish={(values: Partial<Http.IUserPayload>) => onSubmit({ ...values, profile_image: file })}
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
