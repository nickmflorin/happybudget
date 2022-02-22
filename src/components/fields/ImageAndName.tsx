import React, { useState, useImperativeHandle, forwardRef, ForwardedRef } from "react";

import { UserImageUploader, UploadUserImageProps } from "components/fields/uploaders";

import "./ImageAndName.scss";

interface ImageAndNameProps extends StandardComponentProps, Omit<UploadUserImageProps, "firstName" | "lastName"> {
  readonly initialValues?: { first_name: string | null; last_name: string | null };
}

export interface IImageAndNameRef {
  readonly setFirstName: (v: string | null) => void;
  readonly setLastName: (v: string | null) => void;
}

const ImageAndName = (
  { initialValues, ...props }: ImageAndNameProps,
  ref: ForwardedRef<IImageAndNameRef>
): JSX.Element => {
  const [firstName, setFirstName] = useState<string | null>(initialValues?.first_name || null);
  const [lastName, setLastName] = useState<string | null>(initialValues?.last_name || null);

  useImperativeHandle(ref, () => ({
    setFirstName,
    setLastName
  }));

  return (
    <div className={"image-and-name"}>
      <UserImageUploader {...props} firstName={firstName} lastName={lastName} />
      <div className={"name-wrapper"}>
        <div className={"name"}>{firstName}</div>
        <div className={"name"}>{lastName}</div>
      </div>
    </div>
  );
};

export default React.memo(forwardRef(ImageAndName));
