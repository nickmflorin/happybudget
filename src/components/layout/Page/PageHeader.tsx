import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";
import { ShowHide } from "components";

export interface PageHeaderProps extends StandardComponentProps {
  title?: string;
  titleProps?: StandardComponentProps;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, className, titleProps = {}, style = {} }): JSX.Element => {
  return (
    <div className={classNames("page-header", className)} style={style}>
      <ShowHide show={!isNil(title)}>
        <div className={classNames("page-header-title", titleProps.className)} style={titleProps.style}>
          {title}
        </div>
      </ShowHide>
    </div>
  );
};

export default PageHeader;
