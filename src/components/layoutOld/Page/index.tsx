import React, { ReactNode, useMemo } from "react";

import classNames from "classnames";
import { isNil, find, map, filter } from "lodash";

import { WrapInApplicationSpinner } from "components";

import PageFooter from "./PageFooter";
import PageHeader from "./PageHeader";

type PageProps = StandardComponentProps & {
  /* Required for pages that do not have a full page table in them to get the
     content area scrollable. */
  readonly contentScrollable?: boolean;
  readonly children?: SingleOrArray<ReactNode>;
  readonly loading?: boolean;
  readonly pageProps?: StandardComponentProps;
  readonly title: string;
  readonly footer?: JSX.Element;
  readonly subMenu?: JSX.Element[];
};

const Page = (props: PageProps): JSX.Element => {
  const footer = useMemo<JSX.Element | undefined>(
    () =>
      find(
        Array.isArray(props.children) ? props.children : [props.children],
        (child: JSX.Element) => child.type === PageFooter,
      ) as JSX.Element | undefined,
    [props.children],
  );

  const childrenArray = useMemo<JSX.Element[]>(
    () =>
      filter(
        Array.isArray(props.children) ? props.children : [props.children],
        (child: JSX.Element) => child.type !== PageFooter,
      ) as JSX.Element[],
    [props.children],
  );

  return (
    <div className={classNames("page", props.pageProps?.className)} style={props.pageProps?.style}>
      <PageHeader title={props.title} subMenu={props.subMenu} />
      <WrapInApplicationSpinner loading={props.loading}>
        {childrenArray.length !== 0 && (
          <div
            className={classNames("page-content", props.className, {
              scrollable: props.contentScrollable,
            })}
            style={props.style}
          >
            {map(childrenArray, (element: JSX.Element, index: number) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
        )}
      </WrapInApplicationSpinner>
      {!isNil(props.footer) ? (
        <PageFooter>{props.footer}</PageFooter>
      ) : !isNil(footer) ? (
        footer
      ) : (
        <></>
      )}
    </div>
  );
};

const Memoized = React.memo(Page) as React.MemoExoticComponent<
  (props: PageProps) => JSX.Element
> & {
  Footer: typeof PageFooter;
  Header: typeof PageHeader;
};

Memoized.Footer = PageFooter;
Memoized.Header = PageHeader;

export default Memoized;
