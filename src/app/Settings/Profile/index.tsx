import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import { isNil } from "lodash";

import { updateActiveUser } from "api/services";
import { Form } from "components";
import { UserProfileForm } from "components/forms";
import { Page } from "components/layout";
import { updateLoggedInUserAction } from "store/actions";
import { useLoggedInUser } from "store/hooks";
import { getBase64 } from "lib/util/files";

import "./index.scss";

const Profile = (): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm();
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
          onImageChange={(f: File | Blob) => setFile(f)}
          imageUrl={user.profile_image}
          onFinish={(values: Partial<Http.UserPayload>) => {
            const submit = (payload: Partial<Http.UserPayload>) => {
              form.setLoading(true);
              updateActiveUser(payload)
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
            };
            if (!isNil(file)) {
              getBase64(file, (result: ArrayBuffer | string | null) => {
                if (result !== null) {
                  submit({ ...values, profile_image: result });
                }
              });
            } else {
              submit(values);
            }
          }}
        />
      </div>
    </Page>
  );
};

export default Profile;
