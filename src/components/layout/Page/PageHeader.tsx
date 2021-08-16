import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import { ShowHide, VerticalFlexCenter } from "components";

export interface PageHeaderProps extends StandardComponentProps {
  title?: string;
  subTitle?: JSX.Element | JSX.Element[];
  titleProps?: StandardComponentProps;
  extra?: JSX.Element[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  className,
  extra,
  titleProps = {},
  style = {}
}): JSX.Element => {
  return (
    <div className={classNames("page-header", className)} style={style}>
      <div className={classNames("page-header-title", { "with-subtitle": !isNil(subTitle) })}>
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
      {!isNil(subTitle) && <div className={"page-header-subtitle"}>{subTitle}</div>}
    </div>
  );
};

export default PageHeader;
