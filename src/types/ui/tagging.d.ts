/**
 * Represents the required data in it's most basic form that is used to create a
 * Tag component.
 * This is meant to be used for creating MultipleTags components, when we want
 * to provide the data used to create the tags as a series of objects:
 *
 * <MultipleTags tags={[{ text: "foo", color: "red" }]} />
 */
declare interface ITag {
  readonly color?: Style.HexColor | undefined | null;
  readonly textColor?: Style.HexColor | undefined | null;
  readonly uppercase?: boolean;
  readonly text: string;
}

declare type PluralityWithModel<M extends Model.Model = Model.Model> = {
  readonly isPlural?: boolean;
  readonly model: M;
};

declare interface ITagRenderParams<S extends object = React.CSSProperties> {
  readonly className: string | undefined;
  readonly textClassName: string | undefined;
  readonly style: S | undefined;
  readonly textStyle: S | undefined;
  readonly color: Style.HexColor | null;
  readonly textColor: string;
  readonly uppercase: boolean;
  readonly fillWidth: boolean;
  readonly text: string;
  readonly contentRender: ((params: Omit<ITagRenderParams<S>, "contentRender">) => JSX.Element) | undefined;
  readonly onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  readonly disabled?: boolean;
}

declare type TagProps<M extends Model.Model = Model.Model, STYLE extends object = React.CSSProperties> = {
  readonly className?: string;
  readonly textClassName?: string;
  readonly style?: STYLE;
  readonly textStyle?: STYLE;
  readonly children?: string | M | null;
  readonly text?: string | null;
  readonly pluralText?: string | null;
  readonly textColor?: Style.HexColor;
  readonly color?: Style.HexColor | null;
  readonly model?: M | null;
  readonly isPlural?: boolean;
  readonly modelTextField?: keyof M;
  readonly getModelText?: (m: M) => string | null;
  readonly modelColorField?: keyof M;
  readonly getModelColor?: (m: M) => Style.HexColor | null;
  readonly scheme?: Style.HexColor[];
  readonly uppercase?: boolean;
  readonly colorIndex?: number;
  readonly fillWidth?: boolean;
  // Used for custom rendering of the tag - mostly applicable for PDF purposes.
  readonly render?: (params: ITagRenderParams<STYLE>) => JSX.Element;
  // Used for custom rendering of the tag content.
  readonly contentRender?: (params: Omit<ITagRenderParams<STYLE>, "contentRender">) => JSX.Element;
  readonly onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  readonly disabled?: boolean;
};

declare type MultipleTagsProps<M extends Model.Model = Model.Model> = StandardComponentProps & {
  // <Tag> components should be generated based on a set of provided models M.
  readonly models?: (M | PluralityWithModel<M>)[];
  /* <Tag> components are provided as children to the component:
     <MultipleTags><Tag /><Tag /></MultipleTags> */
  readonly children?: JSX.Element[];
  /* <Tag> components should be generated based on a provided Array of objects
		 (ITag), each of which contains the properties necessary to create a <Tag>
		 component. */
  readonly tags?: ITag[];
  readonly tagProps?: Omit<TagProps<M>, "children" | "model" | "text">;
  /* If the list of Models (M) or list of ITag objects or Array of Children
		 <Tag> components is empty, this will either render the component provided
		 by onMissingList or create an <EmptyTag> component with props populated
		 from this attribute. */
  readonly onMissing?: JSX.Element | EmptyTagProps;
};

declare interface VisibleEmptyTagProps extends StandardComponentProps {
  readonly visible?: true;
  readonly text: string;
}

declare interface InvisibleEmptyTagProps extends StandardComponentProps {
  readonly visible: false;
}

declare type EmptyTagProps = VisibleEmptyTagProps | InvisibleEmptyTagProps;
