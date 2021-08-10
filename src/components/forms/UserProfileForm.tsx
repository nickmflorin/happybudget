import React, { useState } from "react";
import classNames from "classnames";

import { Form } from "components";
import { Button } from "components/buttons";
import { Input } from "components/fields";
import { UploadUserImage } from "components/uploaders";
import { FormProps } from "components/forms/Form";
import { TimezoneSelect } from "../fields";

interface UserProfileFormProps extends FormProps<Http.UserPayload> {
  originalImage?: SavedImage | null;
  onImageChange?: (f: UploadedImage | null) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ originalImage, onImageChange, ...props }): JSX.Element => {
  const [firstName, setFirstName] = useState<string | null>(props.initialValues?.first_name);
  const [lastName, setLastName] = useState<string | null>(props.initialValues?.last_name);

  return (
    <Form.Form {...props} className={classNames("user-profile-form", props.className)}>
      <Form.Item
        name={"first_name"}
        label={"First Name"}
        rules={[{ required: true, message: "Please provide your first name." }]}
      >
        <Input
          placeholder={"First Name"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
        />
      </Form.Item>
      <Form.Item
        name={"last_name"}
        label={"Last Name"}
        rules={[{ required: true, message: "Please provide your last name." }]}
      >
        <Input
          placeholder={"Last Name"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
        />
      </Form.Item>
      <Form.Item
        name={"timezone"}
        label={"Time Zone"}
        rules={[{ required: true, message: "Please select a timezone." }]}
      >
        <TimezoneSelect />
      </Form.Item>
      <Form.Item label={"Avatar"}>
        <UploadUserImage
          value={originalImage}
          onChange={(f: UploadedImage | null) => onImageChange?.(f)}
          onError={(error: Error | string) => props.form.setGlobalError(error)}
          firstName={firstName}
          lastName={lastName}
        />
      </Form.Item>
      <Form.Item>
        <Button className={"btn btn--primary"} htmlType={"submit"} style={{ width: "100%" }}>
          {"Save"}
        </Button>
      </Form.Item>
    </Form.Form>
  );
};

export default UserProfileForm;
