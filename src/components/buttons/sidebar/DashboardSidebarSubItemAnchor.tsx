import { useMemo } from "react";

import classNames from "classnames";

import { config as app } from "application";
import { ShowHide } from "components/util";

import { ContentAnchorProps, ContentButtonSubContent } from "../abstract";

import { useSidebarItemAnchorProps } from "./useSidebarItemAnchorProps";

export type DashboardSidebarSubItemAnchorProps<
  I extends app.PageId,
  P extends string = string,
> = Pick<ContentAnchorProps, "className" | "style"> & {
  readonly config: app.DashboardSidebarSubItemConfig<I, P>;
};

export const DashboardSidebarSubItemAnchor = <I extends app.PageId, P extends string = string>({
  config,
  ...props
}: DashboardSidebarSubItemAnchorProps<I, P>): JSX.Element => {
  const page = useMemo(() => app.Pages[config.page], [config.page]);
  // const [user] = store.hooks.useLoggedInUser();

  const { hidden, ...anchorProps } = useSidebarItemAnchorProps({
    config,
    page,
    ...props,
    className: classNames("button--sidebar--dashboard--subitem", props.className),
    sidebarId: app.SidebarIds.DASHBOARD,
  });

  if (hidden === true) {
    return <></>;
  }
  return (
    <div>
      <ContentButtonSubContent {...props} {...anchorProps}>
        <>
          {config.label}
          <ShowHide show={config.tagText !== undefined}>
            <div className="sidebar-menu-item-tag-container">
              {/* <div className="sidebar-menu-item-tag">{config.tagText?.(user)}</div> */}
            </div>
          </ShowHide>
        </>
      </ContentButtonSubContent>
    </div>
  );
};
