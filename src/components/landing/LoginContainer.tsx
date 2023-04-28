"use client";
import { useRouter } from "next/navigation";

import { LoginForm, LoginFormProps } from "components/forms";

export type LoginContainerProps = Omit<LoginFormProps, "onSuccess"> & {
  readonly redirectOnSuccess: string;
};

export const LoginContainer = ({
  redirectOnSuccess,
  ...props
}: LoginContainerProps): JSX.Element => {
  const router = useRouter();
  return (
    <LoginForm
      {...props}
      onSuccess={() => {
        router.push(redirectOnSuccess);
      }}
    />
  );
};
