import { useRouter } from "next/router";
import { useMemo, useEffect, useState } from "react";

import { config as app } from "application";
import { ConditionalTooltip } from "components/tooltips";
import { ShowHide } from "components/util";

import { ContentAnchor, ContentAnchorProps, ContentButtonSubContent } from "../abstract";

import { DashboardSidebarSubItemAnchor } from "./DashboardSidebarSubItemAnchor";
import { useSidebarItemAnchorProps } from "./useSidebarItemAnchorProps";

export type DashboardSidebarItemAnchorProps<I extends app.PageId, P extends string = string> = Pick<
  ContentAnchorProps,
  "className" | "style"
> & {
  readonly page: app.Page<I, P>;
  readonly config: app.DashboardSidebarItemConfig<P>;
};

export const DashboardSidebarItemAnchor = <I extends app.PageId, P extends string = string>({
  config,
  page,
  ...props
}: DashboardSidebarItemAnchorProps<I, P>): JSX.Element => {
  const anchorProps = useSidebarItemAnchorProps({
    config,
    page,
    ...props,
    sidebarId: app.SidebarIds.DASHBOARD,
  });

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = useMemo(
    () => app.sidebarItemIsActive(config, router.asPath),
    [config, router.asPath],
  );

  const hidden = useMemo(
    () => app.sidebarItemIsHidden(config, router.asPath),
    [config, router.asPath],
  );

  useEffect(() => {
    if (active === true) {
      setOpen(true);
    }
  }, [active]);

  if (hidden === true) {
    return <></>;
  } else if (config.subMenu !== undefined && config.subMenu.length !== 0) {
    return (
      <>
        <ConditionalTooltip tooltip={config.tooltip}>
          <div>
            <ContentButtonSubContent {...props} {...anchorProps}>
              {config.label}
            </ContentButtonSubContent>
          </div>
        </ConditionalTooltip>
        <ShowHide show={open}>
          <div className="button--sidebar--dashboard__submenu">
            {config.subMenu.map((subItem: app.DashboardSidebarSubItemConfig, i: number) => (
              <DashboardSidebarSubItemAnchor
                key={i}
                config={subItem}
                closeSidebarOnClick={closeSidebarOnClick}
              />
            ))}
          </div>
        </ShowHide>
      </>
    );
  }
  return (
    <ContentAnchor {...props} {...anchorProps}>
      {config.label}
    </ContentAnchor>
  );
};
