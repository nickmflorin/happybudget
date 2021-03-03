import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isNil, sample } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components/display";

import "./AccountCircleLink.scss";

interface AccountCircleLinkProps {
  className?: string;
  style?: any;
  user?: IUser | ISimpleUser;
  children?: JSX.Element;
  firstName?: string;
  lastName?: string;
  colorAssignMode?: "random" | "deterministic";
  color?: "pink" | "red" | "green" | "blue" | "volcano" | "cyan" | "orange" | "gold" | "purple";
}

const AccountCircleLink = ({
  className,
  firstName,
  lastName,
  children,
  color,
  user,
  colorAssignMode = "deterministic",
  style
}: AccountCircleLinkProps): JSX.Element => {
  const [chosenColor, setChosenColor] = useState("");
  const [initials, setInitials] = useState<string | undefined>(undefined);

  const sumChars = (val: string): number => {
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
      sum += val.charCodeAt(i);
    }
    return sum;
  };

  // Wrap the color choice in an effect so that color change does not happen on
  // rerenders.
  useEffect(() => {
    if (!isNil(initials)) {
      let chosen = color;
      if (isNil(chosen)) {
        const options = ["pink", "red", "green", "blue", "volcano", "cyan", "orange", "gold", "purple"];
        if (colorAssignMode === "random") {
          chosen = sample(options) as
            | "pink"
            | "red"
            | "green"
            | "blue"
            | "volcano"
            | "cyan"
            | "orange"
            | "gold"
            | "purple";
        } else {
          const i = sumChars(initials) % options.length;
          chosen = options[i] as "pink" | "red" | "green" | "blue" | "volcano" | "cyan" | "orange" | "gold" | "purple";
        }
      }
      if (!isNil(chosen)) {
        setChosenColor(chosen);
      }
    }
  }, [initials, color, colorAssignMode]);

  // The initials can be determined from either the explicitly provided user,
  // the explicitly provided first and last names or as a fallback, the email
  // of the expicitly provided user.
  useEffect(() => {
    let first: string | undefined = undefined;
    let last: string | undefined = undefined;
    if (!isNil(user)) {
      if (!isNil(user.first_name) && user.first_name.length !== 0) {
        first = user.first_name;
      } else {
        first = firstName;
      }
    } else {
      first = firstName;
    }
    if (!isNil(user)) {
      if (!isNil(user.last_name) && user.last_name.length !== 0) {
        last = user.last_name;
      } else {
        last = lastName;
      }
    } else {
      last = lastName;
    }
    if (!isNil(first) && first.length !== 0 && !isNil(last) && last.length !== 0) {
      setInitials(`${first[0].toUpperCase()}${last[0].toUpperCase()}`);
    } else if (!isNil(user) && !isNil(user.email) && user.email.length > 1) {
      setInitials(user.email.slice(0, 2).toUpperCase());
    }
  }, [firstName, lastName, user]);

  return (
    <Link to={"#"} className={classNames("account-circle-link", `color-map--${chosenColor}`, className)} style={style}>
      <ShowHide show={!isNil(initials)}>{initials}</ShowHide>
      <ShowHide show={!isNil(children)}>{children}</ShowHide>
    </Link>
  );
};

export default AccountCircleLink;
