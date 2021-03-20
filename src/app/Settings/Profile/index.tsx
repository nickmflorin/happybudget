import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import { Form } from "antd";

import { client, handleRequestError } from "api";
import { UserProfileForm } from "components/forms";
import { Page } from "components/layout";
import { updateLoggedInUserAction } from "store/actions";
import { useLoggedInUser } from "store/hooks";
import { payloadToFormData } from "util/forms";

import "./index.scss";

const Profile = (): JSX.Element => {
  const [form] = Form.useForm();
  const user = useLoggedInUser();
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const dispatch: Dispatch = useDispatch();

  return (
    <Page className={"profile"} title={"Profile"}>
      <div className={"profile-form-container"}>
        <UserProfileForm
          form={form}
          onUploadError={(error: string) => setGlobalError(error)}
          globalError={globalError}
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            profile_image: user.profile_image
          }}
          onSubmit={(payload: Partial<Http.IUserPayload>) => {
            setGlobalError(undefined);
            const formData = payloadToFormData<Partial<Http.IUserPayload>>(payload);
            client
              .patch<IUser>("/v1/users/user/", formData)
              .then((response: IUser) => {
                dispatch(updateLoggedInUserAction(response));
                toast.success("Your information has been successfully saved.");
              })
              .catch((e: Error) => {
                handleRequestError(e, "There was an error saving your information.", {
                  client: (error: string) => setGlobalError(error)
                });
              });
          }}
        />
      </div>
    </Page>
  );
};

export default Profile;
