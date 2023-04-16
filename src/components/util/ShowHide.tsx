import React, { ReactNode } from "react";

type ShowProps = {
  readonly show: boolean;
  readonly children: ReactNode;
};

type HideProps = {
  readonly hide: boolean;
  readonly children: ReactNode;
};

type ShowHideProps = ShowProps | HideProps;

const isShowProps = (props: ShowHideProps): props is ShowProps =>
  (props as ShowProps).show !== undefined;

const _ShowHide = (props: ShowHideProps): JSX.Element =>
  isShowProps(props) ? (
    props.show === true ? (
      <>{props.children}</>
    ) : (
      <></>
    )
  ) : props.hide === true ? (
    <></>
  ) : (
    <>{props.children}</>
  );

export const ShowHide = React.memo(_ShowHide);
