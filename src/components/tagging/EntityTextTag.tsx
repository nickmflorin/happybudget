import EntityText, { EntityTextProps } from "components/typography/EntityText";
import Tag from "./Tag";

type EntityTextTagProps<
  M extends Model.HttpModel,
  S extends React.CSSProperties | Pdf.Style = React.CSSProperties
> = Omit<TagProps<M, S>, "model"> & EntityTextProps;

const EntityTextTag = <M extends Model.HttpModel, S extends React.CSSProperties | Pdf.Style = React.CSSProperties>({
  fillEmpty,
  children,
  ...props
}: EntityTextTagProps<M, S>): JSX.Element => {
  return <Tag {...props} render={() => <EntityText fillEmpty={fillEmpty}>{children}</EntityText>}></Tag>;
};

export default EntityTextTag;
