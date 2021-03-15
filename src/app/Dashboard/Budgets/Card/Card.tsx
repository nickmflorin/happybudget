import React, { useEffect, useState } from "react";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { Dropdown } from "components/control/dropdowns";
import { IconButton } from "components/control/buttons";
import { ShowHide, RenderWithSpinner } from "components/display";
import {
  ActorsIcon,
  DirectorIcon,
  DollyIcon,
  EditorIcon,
  SceneIcon,
  SFXIcon,
  SoundIcon,
  WriterIcon
} from "components/svgs";
import "./Card.scss";

export const Icons: (() => JSX.Element)[] = [
  ActorsIcon,
  DirectorIcon,
  DollyIcon,
  EditorIcon,
  SceneIcon,
  SFXIcon,
  SoundIcon,
  WriterIcon
];

export const Colors: string[] = [
  "#8688A8",
  "#8688A8",
  "#B27FAA",
  "#57AD71",
  "#FFD752",
  "#C17F73",
  "#AD5757",
  "#50C4BB",
  "#80A1DE"
];

interface CardProps {
  dropdown?: IMenuItem[];
  selected?: boolean;
  title?: string;
  subTitle?: string;
  loading?: boolean;
  onClick?: () => void;
  onSelect?: (checked: boolean) => void;
}

const Card = ({ title, subTitle, dropdown, onClick, loading, selected = false, onSelect }: CardProps): JSX.Element => {
  const [color, setColor] = useState<string | undefined>(undefined);
  const [Icon, setIcon] = useState<(() => JSX.Element) | undefined>(undefined);

  const sumChars = (val: string): number => {
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
      sum += val.charCodeAt(i);
    }
    return sum;
  };

  useEffect(() => {
    if (!isNil(title)) {
      const iC = sumChars(title) % Colors.length;
      setColor(Colors[iC]);

      const iI = sumChars(title) % Icons.length;
      setIcon(Icons[iI]);
    }
  }, [title]);

  return (
    <div className={"budget-card"}>
      <RenderWithSpinner loading={loading}>
        <React.Fragment>
          <Checkbox
            className={"card-checkbox"}
            checked={selected}
            onChange={(e: CheckboxChangeEvent) => {
              if (!isNil(onSelect)) {
                onSelect(e.target.checked);
              }
            }}
          />
          {!isNil(dropdown) && (
            <Dropdown items={dropdown}>
              <IconButton className={"card-dropdown-ellipsis"} icon={<FontAwesomeIcon icon={faEllipsisV} />} />
            </Dropdown>
          )}
          <div className={"budget-card-icon-wrapper"} onClick={onClick} style={{ backgroundColor: color }}>
            {!isNil(Icon) && Icon}
          </div>
          <div className={"budget-card-footer"} onClick={onClick}>
            <ShowHide show={!isNil(title)}>
              <div className={"title"}>{title}</div>
            </ShowHide>
            <ShowHide show={!isNil(subTitle)}>
              <div className={"subTitle"}>{subTitle}</div>
            </ShowHide>
          </div>
        </React.Fragment>
      </RenderWithSpinner>
    </div>
  );
};

export default Card;
