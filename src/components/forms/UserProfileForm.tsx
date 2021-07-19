import React, { useState } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Input, Button } from "antd";

import { Form } from "components";
import { UserImageOrInitials, EditImageOverlay } from "components/images";
import { FormProps } from "components/forms/Form";
import { UploadUserImage, TimezoneSelect } from "./fields";

interface UserProfileFormProps extends FormProps<Http.UserPayload> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ imageUrl, onImageChange, ...props }): JSX.Element => {
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
          initialValue={imageUrl}
          onChange={(f: File | Blob) => {
            if (!isNil(onImageChange)) {
              onImageChange(f);
            }
          }}
          onError={(error: string) => props.form.setGlobalError(error)}
          renderContent={(url: string | null) => {
            return (
              <UserImageOrInitials
                circle={true}
                src={url}
                firstName={firstName}
                lastName={lastName}
                overlay={() => <EditImageOverlay visible={true} />}
              />
            );
          }}
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
