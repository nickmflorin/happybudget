import { useState, useEffect, useRef, useMemo } from "react";

import * as api from "api";
import { isNil } from "lodash";

import * as store from "application/store";
import { ui, model, notifications } from "lib";
import { Tile } from "components/containers";
import { ImageAndName } from "components/fields";
import { IImageAndNameRef } from "components/fields/ImageAndName";
import { UserProfileForm } from "components/forms";
import { Page } from "components/layoutOld";

const Profile = (): JSX.Element => {
  const form = ui.form.useForm<Http.UserPayload>();
  const [user, updateUser] = store.hooks.useLoggedInUser();
  const [image, setImage] = useState<UploadedImage | SavedImage | null>(null);
  /*
  Note: We have to use a ref here, instead of storing firstName and lastName in
	the state of this component, because if we were storing it in this component,
	when the firstName and lastName change it causes the entire component to
	rerender, and AntD rerenders all form fields when the form rerenders, which
	causes the auto focus to be lost on the first and last name fields.
  */
  const headerRef = useRef<IImageAndNameRef | null>(null);

  useEffect(() => {
    setImage(user.profile_image);
  }, [user]);

  const onValuesChange = useMemo(
    () => (changedValues: Partial<Http.ContactPayload>) => {
      if (!isNil(changedValues.first_name)) {
        headerRef.current?.setFirstName(changedValues.first_name);
      }
      if (!isNil(changedValues.last_name)) {
        headerRef.current?.setLastName(changedValues.last_name);
      }
    },
    [],
  );

  return (
    <Page className="profile" title="Profile">
      <Tile style={{ maxWidth: 500 }}>
        <UserProfileForm
          form={form}
          onValuesChange={onValuesChange}
          formHeaderProps={{ style: { height: 108 } }}
          title={
            <ImageAndName
              value={image}
              ref={headerRef}
              onChange={(f: UploadedImage | null) => setImage(f)}
              onError={(error: Error | string) => form.notify(error)}
            />
          }
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            timezone: user.timezone,
          }}
          onFinish={(values: Partial<Http.UserPayload>) => {
            form.setLoading(true);
            let payload = { ...values };
            if (!isNil(image) && model.isUploadedImage(image)) {
              payload = { ...payload, profile_image: image.data };
            } else if (isNil(image)) {
              payload = { ...payload, profile_image: null };
            }
            api
              .updateActiveUser(payload)
              .then((response: Model.User) => {
                notifications.ui.banner.notify({
                  level: "success",
                  message: "Your information was successfully saved.",
                });
                updateUser(response);
              })
              .catch((e: Error) => form.handleRequestError(e))
              .finally(() => form.setLoading(false));
          }}
        />
      </Tile>
    </Page>
  );
};

export default Profile;
