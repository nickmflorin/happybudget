import { isNil } from "lodash";
import { Tag } from "components/tagging";

import { ExpandedModelTagsMenuProps } from "./model";
import ExpandedModelMenu from "./ExpandedModelMenu";

const ExpandedModelTagsMenu = <M extends Model.M>(props: ExpandedModelTagsMenuProps<M>): JSX.Element => {
  return (
    <ExpandedModelMenu<M>
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

export default ExpandedModelTagsMenu;
