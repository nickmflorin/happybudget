import { Tag } from "components/tagging";
import classNames from "classnames";
import { Text } from "./Base";

const PdfTag = <M extends Model.Model = Model.Model>(props: TagProps<M>): JSX.Element => {
  return (
    <Tag<M>
      {...props}
      render={(params: ITagRenderParams) => {
        return (
          <Text
            className={classNames(
              "tag-text",
              { uppercase: props.uppercase },
              { "fill-width": props.fillWidth },
              props.className
            )}
            style={{ ...props.style, backgroundColor: params.color, color: params.textColor }}
          >
            {params.text}
          </Text>
        );
      }}
    />
  );
};

export default PdfTag;
