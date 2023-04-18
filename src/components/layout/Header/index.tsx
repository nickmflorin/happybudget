import classNames from "classnames";

import { ui } from "lib";

import { NotificationsDropdownButton, ProfileDropdownButton } from "components/buttons";

export type HeaderProps = ui.ComponentProps;

export const Header = (props: HeaderProps): JSX.Element => (
  <header {...props} className={classNames("header", props.className)}>
    {/* Once we implement a Menu and a DropdownMenu component, these will have to be wrapped by the
        DropdownMenu component and configured to display a list of options. */}
    <ProfileDropdownButton />
    <NotificationsDropdownButton />
  </header>
);
