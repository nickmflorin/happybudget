import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import { ShowHide, VerticalFlexCenter } from "components";

export interface PageHeaderProps extends StandardComponentProps {
  title?: string;
  titleProps?: StandardComponentProps;
  extra?: JSX.Element[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  className,
  extra,
  titleProps = {},
  style = {}
}): JSX.Element => {
  return (
    <div className={classNames("page-header", className)} style={style}>
      <div className={"title-wrapper"}>
        <ShowHide show={!isNil(title)}>
          <div className={classNames("page-header-title", titleProps.className)} style={titleProps.style}>
            {title}
          </div>
        </ShowHide>
      </div>
      {!isNil(extra) && (
        <div className={"extra-wrapper"}>
          {map(extra, (item: JSX.Element) => {
            return <VerticalFlexCenter>{item}</VerticalFlexCenter>;
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
