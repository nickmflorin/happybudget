import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { Button } from "components/buttons";
import { Input } from "components/fields";
import { TimezoneSelect } from "../fields";

const UserProfileForm: React.FC<FormProps<Http.UserPayload>> = (props): JSX.Element => {
  return (
    <Form.Form {...props} className={classNames("user-profile-form", props.className)} layout={"vertical"}>
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
      <Form.Item name={"company"} label={"Company"}>
        <Input />
      </Form.Item>
      <Form.Item name={"position"} label={"Job Title"}>
        <Input />
      </Form.Item>
      <Form.Item name={"city"} label={"City"}>
        <Input />
      </Form.Item>
      <Form.Item name={"phone_number"} label={"Phone Number"}>
        <Input />
      </Form.Item>
      <Form.Item
        name={"timezone"}
        label={"Time Zone"}
        rules={[{ required: true, message: "Please select a timezone." }]}
      >
        <TimezoneSelect />
      </Form.Item>
      <Form.Footer>
        <Button className={"btn btn--primary"} htmlType={"submit"} style={{ width: "100%" }}>
          {"Save"}
        </Button>
      </Form.Footer>
    </Form.Form>
  );
};

export default UserProfileForm;
