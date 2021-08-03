import React, { useState } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Input, Button } from "antd";

import * as typeguards from "lib/model/typeguards";

import { Form, FullSize } from "components";
import { ImageClearButton } from "components/buttons";
import { UserImageOrInitials, EditImageOverlay } from "components/images";
import { FormProps } from "components/forms/Form";
import { UploadUserImage, TimezoneSelect } from "./fields";

interface UserProfileFormProps extends FormProps<Http.UserPayload> {
  originalImage?: Model.Image | null;
  onImageChange?: (f: File | Blob | null) => void;
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
          original={originalImage}
          onChange={(f: UploadedData | null) => {
            if (!isNil(onImageChange)) {
              onImageChange(!isNil(f) ? f.file : null);
            }
          }}
          onError={(error: Error | string) => props.form.setGlobalError(error)}
          renderContentNoError={(params: UploadFileParamsNoError, original: Model.Image | null) => {
            return (
              <FullSize>
                <ImageClearButton
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={(e: React.MouseEvent<any>) => {
                    e.stopPropagation();
                    e.preventDefault();
                    params.onClear();
                  }}
                />
                <UserImageOrInitials
                  circle={true}
                  src={
                    /* eslint-disable indent */
                    typeguards.isUploadParamsWithData(params)
                      ? params.data.url
                      : !isNil(original)
                      ? original.url
                      : undefined
                  }
                  firstName={firstName}
                  lastName={lastName}
                  overlay={() => <EditImageOverlay visible={true} />}
                />
              </FullSize>
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
