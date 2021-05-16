import { Ref, useMemo, forwardRef } from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";

import { ExpandedModelTagsMenuProps, ExpandedModelMenuRef } from "./model";
import createExpandedModelMenu from "./ExpandedModelMenu";

const ExpandedModelTagsMenu = <M extends Model.M>(props: ExpandedModelTagsMenuProps<M>): JSX.Element => {
  const ExpandedModelMenu = useMemo(() => createExpandedModelMenu<M>(), []);
  return (
    <ExpandedModelMenu
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

export const TypeAgnosticExpandedModelTagsMenu = forwardRef(
  (props: ExpandedModelTagsMenuProps<any>, ref?: Ref<ExpandedModelMenuRef<any>>) => (
    <ExpandedModelTagsMenu<any> {...props} forwardedRef={ref} />
  )
);

const createExpandedModelTagsMenu = <M extends Model.M>() => {
  return forwardRef((props: ExpandedModelTagsMenuProps<M>, ref?: Ref<ExpandedModelMenuRef<M>>) => (
    <ExpandedModelTagsMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createExpandedModelTagsMenu;
