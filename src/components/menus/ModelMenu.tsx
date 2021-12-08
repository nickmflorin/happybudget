import classNames from "classnames";
import GenericMenu from "./Generic";

export type ModelMenuProps<M extends Model.Model> = Omit<IMenu<M>, "renderItemContent"> & {
  readonly menu?: NonNullRef<IMenuRef<M>>;
} & {
  readonly renderItemContent: (model: M) => JSX.Element;
};

const ModelMenu = <M extends Model.Model>(props: ModelMenuProps<M>): JSX.Element => (
  <GenericMenu<M> {...props} className={classNames("model-menu", props.className)} />
);

export default ModelMenu;
