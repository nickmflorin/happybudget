import { Tag } from "components/tagging";

import ExpandedModelMenu from "./ExpandedModelMenu";

const ExpandedModelTagsMenu = <M extends Model.M>(props: ExpandedModelTagsMenuProps<M>): JSX.Element => {
  return <ExpandedModelMenu<M> {...props} renderItem={(model: M) => <Tag<M> model={model} {...props.tagProps} />} />;
};

export default ExpandedModelTagsMenu;
