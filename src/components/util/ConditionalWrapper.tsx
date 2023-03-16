import React, { ReactNode } from "react";

type ConditionalWrapperProps = StandardComponentProps & {
  readonly conditional: boolean | undefined;
  readonly children: ReactNode | ((wrapped: boolean) => ReactNode);
};

const ConditionalWrapper = ({
  conditional,
  children,
  ...props
}: ConditionalWrapperProps): JSX.Element =>
  conditional ? (
    <div {...props}>{typeof children === "function" ? children(true) : children}</div>
  ) : (
    <>{typeof children === "function" ? children(false) : children}</>
  );

export default React.memo(ConditionalWrapper);
