import React from "react";
import EntityText, { EntityTextProps } from "components/typography/EntityText";
import Tag from "./Tag";

type EntityTextTagProps<
  M extends Model.HttpModel,
  S extends React.CSSProperties | Pdf.Style = React.CSSProperties
> = EntityTextProps & {
  readonly tagProps?: Omit<TagProps<M, S>, "model">;
};

const EntityTextTag = <M extends Model.HttpModel, S extends React.CSSProperties | Pdf.Style = React.CSSProperties>({
  tagProps,
  ...props
}: EntityTextTagProps<M, S>): JSX.Element => <Tag {...tagProps} render={() => <EntityText {...props} />} />;

export default React.memo(EntityTextTag);
