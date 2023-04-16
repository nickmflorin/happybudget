import classNames from "classnames";

import { config } from "application";
import { Icon } from "components/icons";

import { BareActionAnchor, BareActionAnchorProps } from "./BareActionButton";

export type SidebarAnchorProps<
  I extends config.SidebarPageId = config.SidebarPageId,
  P extends string = string,
> = Omit<
  BareActionAnchorProps,
  "disabled" | "loading" | "onClick" | "color" | "locked" | "size" | "icon"
> &
  Omit<config.SidebarPage<I, P>, "active" | "hidden" | "location"> & {
    readonly active?: boolean;
  };

export const SidebarAnchor = ({
  icon,
  pathname,
  active,
  emphasize,
  ...props
}: SidebarAnchorProps): JSX.Element => (
  <BareActionAnchor
    {...props}
    id={`sidebar-anchor-${props.id}`}
    className={classNames(
      "button--action--bare--sidebar",
      {
        "button--action--bare--sidebar--active": active,
        "button--action--bare--sidebar--emphasize": emphasize,
      },
      props.className,
    )}
    to={{ pathname }}
    icon={<Icon className="icon--sidebar-anchor" icon={icon} />}
  />
);
