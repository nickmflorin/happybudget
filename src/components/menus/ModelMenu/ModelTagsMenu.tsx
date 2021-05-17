import { isNil } from "lodash";
import { Tag } from "components/tagging";

import { ModelTagsMenuProps } from "./model";
import ModelMenu from "./ModelMenu";

const ModelTagsMenu = <M extends Model.M>(props: ModelTagsMenuProps<M>): JSX.Element => {
  return (
    <ModelMenu
      searchIndices={!isNil(props.modelTextField) ? [props.modelTextField] : undefined}
      {...props}
      renderItem={(model: M) => (
        <Tag
          model={model}
          uppercase={props.uppercase}
          modelTextField={props.modelTextField}
          modelColorField={props.modelColorField}
          fillWidth={props.fillWidth}
          {...props.tagProps}
        />
      )}
    />
  );
};

export default ModelTagsMenu;
