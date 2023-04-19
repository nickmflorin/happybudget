import { useRouter } from "next/router";
import { useMemo } from "react";

import classNames from "classnames";

import { config as app } from "application";
import { ui } from "lib";

import { AnchorProps } from "../abstract";

export type UseSidebarItemAnchorProps<
  T extends app.SidebarId,
  I extends app.PageId,
  P extends string = string,
> = Pick<ui.ComponentProps, "className" | "style"> & {
  readonly page: app.Page<I, P>;
  readonly config: app.SidebarItemConfig<T>;
  readonly sidebarId: T;
};

export const useSidebarItemAnchorProps = <
  T extends app.SidebarId,
  I extends app.PageId,
  P extends string = string,
>({
  config,
  page,
  sidebarId,
  ...props
}: UseSidebarItemAnchorProps<T, I, P>): {
  readonly tooltip: ui.Tooltip | undefined;
  readonly icon: ui.IconProp | undefined;
  readonly className: string;
  readonly to: AnchorProps["to"];
  readonly id: string;
  readonly hidden: boolean;
} => {
  const router = useRouter();

  const active = useMemo(
    () => app.sidebarItemIsActive(config, router.asPath),
    [config, router.asPath],
  );

  const hidden = useMemo(
    () => app.sidebarItemIsHidden(config, router.asPath),
    [config, router.asPath],
  );

  return {
    id: `sidebar-anchor-${page.id}`,
    hidden,
    tooltip: config.tooltip,
    icon: active ? config.activeIcon || config.icon : config.icon,
    className: classNames(
      "button--sidebar",
      `button--sidebar--${sidebarId}`,
      {
        "button--sidebar--active": active,
      },
      props.className,
    ),
    to: { pathname: page.pathname },
  };
};
