import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconPrefix } from "@fortawesome/fontawesome-svg-core";

/* eslint-disable no-unused-vars */
const PrefixMap: { [key in IconWeight]: IconPrefix } = { light: "fal", regular: "far", solid: "fas" };

const Icon: React.FC<IIcon> = ({ icon, green, prefix, weight, light, regular, solid, ...props }) => {
  const derivedPrefix = useMemo(() => {
    if (!isNil(prefix)) {
      return prefix;
    } else if (!isNil(weight)) {
      return PrefixMap[weight];
    } else if (light === true) {
      return "fal";
    } else if (solid === true) {
      return "fas";
    }
    return "far";
  }, [weight, light, regular, solid]);

  if (!isNil(icon)) {
    return (
      <FontAwesomeIcon
        {...props}
        className={classNames("icon", { "icon--green": green }, props.className)}
        icon={typeof icon === "string" ? [derivedPrefix, icon] : icon}
      />
    );
  }
  return <></>;
};

export default React.memo(Icon);
