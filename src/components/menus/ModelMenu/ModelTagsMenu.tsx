import { Tag } from "components/tagging";

import ModelMenu from "./ModelMenu";

const ModelTagsMenu = <M extends Model.M>(props: ModelTagsMenuProps<M>): JSX.Element => {
  return <ModelMenu {...props} renderItem={(model: M) => <Tag model={model} {...props.tagProps} />} />;
};

export default ModelTagsMenu;
