import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

export interface PageHeaderProps extends StandardComponentProps {
  readonly title: string;
  readonly titleProps?: StandardComponentProps;
  readonly subMenu?: JSX.Element[];
}

const PageHeader = ({ title, titleProps = {}, subMenu, ...props }: PageHeaderProps): JSX.Element => (
  <div {...props} className={classNames("page-header", props.className)}>
    <div
      className={classNames("page-header-title", titleProps?.className, {
        "with-sub-menu": !isNil(subMenu) && subMenu.length !== 0
      })}
      style={titleProps?.style}
    >
      {title}
    </div>
    {!isNil(subMenu) && (
      <div className={"sub-menu"}>
        {map(subMenu, (element: JSX.Element, index: number) => (
          <React.Fragment key={index}>{element}</React.Fragment>
        ))}
      </div>
    )}
  </div>
);

export default React.memo(PageHeader);
