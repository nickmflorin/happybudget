import { Ref, useMemo, forwardRef } from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";

import { ModelTagsMenuProps, ModelMenuRef } from "./model";
import createModelMenu from "./ModelMenu";

const ModelTagsMenu = <M extends Model.M>(props: ModelTagsMenuProps<M>): JSX.Element => {
  const ModelMenu = useMemo(() => createModelMenu<M>(), []);
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

export const TypeAgnosticModelTagsMenu = forwardRef((props: ModelTagsMenuProps<any>, ref?: Ref<ModelMenuRef<any>>) => (
  <ModelTagsMenu<any> {...props} forwardedRef={ref} />
));

const createModelTagsMenu = <M extends Model.M>() => {
  return forwardRef((props: ModelTagsMenuProps<M>, ref?: Ref<ModelMenuRef<M>>) => (
    <ModelTagsMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createModelTagsMenu;
