import React, { ReactNode, useMemo } from "react";
import classNames from "classnames";
import { isNil, find, map, filter } from "lodash";
import { WrapInApplicationSpinner } from "components";

import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";

import "./index.scss";

interface PageProps extends StandardComponentProps {
  readonly className?: string;
  // Required for pages that do not have a full page table in them to get the
  // content area scrollable.
  readonly contentScrollable?: boolean;
  readonly children?: SingleOrArray<ReactNode>;
  readonly loading?: boolean;
  readonly style?: React.CSSProperties;
  readonly title?: string;
  readonly subTitle?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly extra?: JSX.Element[];
}

const Page = (props: PageProps): JSX.Element => {
  const footer = useMemo<JSX.Element | undefined>(() => {
    return find(
      Array.isArray(props.children) ? props.children : [props.children],
      (child: JSX.Element) => child.type === PageFooter
    ) as JSX.Element | undefined;
  }, [props.children]);

  const childrenArray = useMemo<JSX.Element[]>(() => {
    return filter(
      Array.isArray(props.children) ? props.children : [props.children],
      (child: JSX.Element) => child.type !== PageFooter
    ) as JSX.Element[];
  }, [props.children]);

  return (
    <div className={"page"} style={props.style}>
      {!isNil(props.title) && (
        <PageHeader title={props.title} extra={props.extra}>
          {props.subTitle}
        </PageHeader>
      )}
      <WrapInApplicationSpinner loading={props.loading}>
        {childrenArray.length !== 0 && (
          <div className={classNames("page-content", props.className, { scrollable: props.contentScrollable })}>
            {map(childrenArray, (element: JSX.Element, index: number) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
        )}
      </WrapInApplicationSpinner>
      {!isNil(props.footer) ? <PageFooter>{props.footer}</PageFooter> : !isNil(footer) ? footer : <></>}
    </div>
  );
};

Page.Footer = PageFooter;
Page.Header = PageHeader;
export default Page;
