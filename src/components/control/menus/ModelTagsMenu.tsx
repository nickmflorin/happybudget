import { map } from "lodash";
import classNames from "classnames";
import { Menu } from "antd";
import { Tag } from "components/display";
import { getKeyValue } from "util/objects";

import "./ModelTagsMenu.scss";

export interface ModelTagsMenuProps<M extends Model> extends StandardComponentProps {
  models: M[];
  onChange: (model: M) => void;
  labelField: keyof M;
  uppercase?: boolean;
}

const ModelTagsMenu = <M extends Model>({
  /* eslint-disable indent */
  onChange,
  models,
  className,
  labelField,
  uppercase = true,
  style = {}
}: ModelTagsMenuProps<M>): JSX.Element => {
  return (
    <Menu className={classNames("model-tags-menu", className)} style={style}>
      {map(models, (model: M) => {
        const label = getKeyValue<M, keyof M>(labelField)(model);
        if (typeof label === "string") {
          return (
            <Menu.Item key={model.id} className={"model-tags-menu-item"} onClick={(info: any) => onChange(model)}>
              <Tag colorIndex={model.id} uppercase={uppercase}>
                {label}
              </Tag>
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );
};

export default ModelTagsMenu;
