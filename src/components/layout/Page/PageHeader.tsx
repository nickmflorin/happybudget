import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import { ShowHide, VerticalFlexCenter } from "components";

export interface PageHeaderProps extends StandardComponentWithChildrenProps {
  readonly title?: string;
  readonly titleProps?: StandardComponentProps;
  readonly extra?: JSX.Element[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, extra, titleProps = {}, children, ...props }): JSX.Element => {
  return (
    <div {...props} className={classNames("page-header", props.className)}>
      <div className={classNames("page-header-title")}>
        <div className={"title-text-wrapper"}>
          <ShowHide show={!isNil(title)}>
            <div className={classNames("page-header-title-text", titleProps.className)} style={titleProps.style}>
              {title}
            </div>
          </ShowHide>
        </div>
        {!isNil(extra) && (
          <div className={"extra-wrapper"}>
            {map(extra, (item: JSX.Element, index: number) => {
              return <VerticalFlexCenter key={index}>{item}</VerticalFlexCenter>;
            })}
          </div>
        )}
      </div>
      {!isNil(children) && <div className={"page-header-subtitle"}>{children}</div>}
    </div>
  );
};

export default PageHeader;
