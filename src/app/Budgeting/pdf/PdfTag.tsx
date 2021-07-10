import { Tag } from "components/tagging";
import classNames from "classnames";
import { View, Text } from "./Base";

const PdfTag = <M extends Model.Model = Model.Model>(props: TagProps<M>): JSX.Element => {
  return (
    <Tag<M>
      {...props}
      render={(params: ITagRenderParams) => {
        return (
          <View
            className={classNames(
              "tag",
              { uppercase: props.uppercase },
              { "fill-width": props.fillWidth },
              props.className
            )}
            style={{ ...props.style, backgroundColor: params.color, color: params.textColor }}
          >
            <Text className={"tag-text"}>{params.text}</Text>
          </View>
        );
      }}
    />
  );
};

export default PdfTag;
