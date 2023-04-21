import React, { useMemo } from "react";

import classNames from "classnames";

import { errors, config } from "application";
import { feedback as Feedback } from "lib";
import { Head } from "components/compat";
import { GlobalFeedbackDisplay } from "components/feedback";
import { Loading } from "components/loading";
import { Header } from "components/structural";

type _BasePageProps<I extends config.PageId> = {
  readonly id: I;
  readonly className?: string;
  readonly title?: string;
  readonly head?: config.HeadOptions;
  readonly children: JSX.Element | JSX.Element[];
  readonly feedback?: (errors.GlobalFeedbackError | Feedback.GlobalErrorFeedback | undefined)[];
  readonly loading?: boolean;
};

export type PageProps<I extends config.PageId> = I extends keyof config.PageCallbackParams
  ? _BasePageProps<I> & {
      readonly params: config.PageCallbackParams[I];
    }
  : _BasePageProps<I> & {
      readonly params?: undefined;
    };

const mergeHead = <I extends config.PageId>(
  props: Pick<PageProps<I>, "id" | "head" | "params">,
): config.HeadOptions => {
  const page = config.Pages[props.id];
  /* if (typeof page.head === "function" && props.params !== undefined) {
       return { ...props.head, ...page.head(props.params) };
     } else if (typeof page.head !== "function") {
       return { ...props.head, ...page.head };
     } */
  if (typeof page.head !== "function") {
    return { ...props.head, ...page.head };
  }
  return { ...props.head };
};

const mergeTitle = <I extends config.PageId>(
  props: Pick<PageProps<I>, "id" | "title" | "params">,
): string | undefined => {
  const page = config.Pages[props.id];
  if (props.title !== undefined) {
    return props.title;
  }
  /* } else if (typeof page.title === "function" && props.params !== undefined) {
       return page.title(props.params);
     } else if (typeof page.title === "string") {
       return page.title;
     } */
  if (typeof page.title !== "function") {
    return page.title;
  }

  return undefined;
};

/**
 * A component that represents the outer structure of a given page in the application.  All pages
 * that have a dedicated navigation route should use this component at the top level.
 */
export const Page = <I extends config.PageId>({
  id,
  head,
  title,
  children,
  params,
  feedback,
  loading,
  ...props
}: PageProps<I>): JSX.Element => {
  const _title = useMemo(() => mergeTitle({ title, id, params }), [title, id, params]);

  return (
    <Loading loading={loading}>
      <div {...props} id={`page-${id}`} className={classNames("page", props.className)}>
        <Head {...mergeHead<I>({ head, id, params })} />
        <div className="page__content">
          {_title !== undefined && <Header level={1}>{_title}</Header>}
          <GlobalFeedbackDisplay
            className={classNames("global-feedback-display--page")}
            feedback={feedback || []}
          />
          {children}
        </div>
      </div>
    </Loading>
  );
};
