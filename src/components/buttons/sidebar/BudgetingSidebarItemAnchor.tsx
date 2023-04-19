import { useRouter } from "next/router";
import { useMemo } from "react";

import classNames from "classnames";

import { config as app } from "application";

import { BareActionAnchor, BareActionAnchorProps } from "../BareActionButton";

export type BudgetingSidebarItemAnchorProps<I extends app.PageId, P extends string = string> = Pick<
  BareActionAnchorProps,
  "className" | "style" | "ref" | "onFocus" | "onBlur"
> & {
  readonly page: app.Page<I, P>;
  readonly config: app.BudgetingSidebarItemConfig<P>;
};

export const BudgetingSidebarItemAnchor = <I extends app.PageId, P extends string = string>({
  config,
  page,
  ...props
}: BudgetingSidebarItemAnchorProps<I, P>): JSX.Element => {
  const router = useRouter();

  const active = useMemo(
    () => app.sidebarItemIsActive(config, router.asPath),
    [config, router.asPath],
  );

  if (config.hidden === true) {
    return <></>;
  }
  return (
    <BareActionAnchor
      {...props}
      tooltip={config.tooltip}
      icon={config.icon}
      id={`sidebar-anchor-${page.id}`}
      className={classNames(
        "button--sidebar",
        "button--sidebar--budgeting",
        {
          "button--sidebar--active": active,
        },
        props.className,
      )}
      to={{ pathname: page.pathname }}
    />
  );
};
