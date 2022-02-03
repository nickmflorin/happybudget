import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Typography } from "antd";

import { ShowHide } from "components";

interface LandingFormContainerProps extends StandardComponentWithChildrenProps {
  readonly title?: string;
  readonly subTitle?: string;
}

const LandingFormContainer = (props: LandingFormContainerProps): JSX.Element => (
  <div className={classNames("landing-form-container", props.className)} style={props.style}>
    <ShowHide show={!isNil(props.title)}>
      <Typography.Title className={"title"}>{props.title}</Typography.Title>
    </ShowHide>
    <ShowHide show={!isNil(props.subTitle)}>
      <Typography.Title className={"sub-title"}>{props.subTitle}</Typography.Title>
    </ShowHide>
    {props.children}
  </div>
);

export default React.memo(LandingFormContainer);
