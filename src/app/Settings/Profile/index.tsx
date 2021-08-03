import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { UserProfileForm } from "components/forms";
import { Page } from "components/layout";
import { updateLoggedInUserAction } from "store/actions";
import { useLoggedInUser } from "store/hooks";

import "./index.scss";

const Profile = (): JSX.Element => {
  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.UserPayload>();
  const user = useLoggedInUser();
  const dispatch: Dispatch = useDispatch();

  return (
    <Page className={"profile"} title={"Profile"}>
      <div className={"profile-form-container"}>
        <UserProfileForm
          form={form}
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            timezone: user.timezone
          }}
          onImageChange={(f: UploadedImage | null) => setFile(f)}
          originalImage={user.profile_image}
          onFinish={(values: Partial<Http.UserPayload>) => {
            form.setLoading(true);
            const payload = { ...values, profile_image: !isNil(file) ? file.data : null };
            api
              .updateActiveUser(payload)
              .then((response: Model.User) => {
                dispatch(updateLoggedInUserAction(response));
                toast.success("Your information has been successfully saved.");
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          }}
        />
      </div>
    </Page>
  );
};

export default Profile;
