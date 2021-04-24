import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";

import "./Icon.scss";
import { isNil } from "lodash";

export type IconName = "plus";
export type IconType = IconDefinition | IconName;

const Icons: { [key in IconName]: IconDefinition } = { plus: faPlus };

const isIconDefinition = (name: IconType): name is IconDefinition => {
  return (name as IconDefinition).icon !== undefined;
};

interface IconProps extends StandardComponentProps {
  name?: IconType | null | undefined;
}

const Icon: React.FC<IconProps> = ({ name, className, style = {} }) => {
  if (!isNil(name)) {
    return (
      <FontAwesomeIcon
        className={classNames("icon", className)}
        style={style}
        icon={isIconDefinition(name) ? name : Icons[name]}
      />
    );
  }
  return <></>;
};

export default Icon;
