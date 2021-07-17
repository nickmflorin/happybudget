import { Tag as ReactTag } from "components/tagging";
import classNames from "classnames";
import { isNil } from "lodash";
import { Style } from "@react-pdf/types";
import View from "./View";
import Text from "./Text";

const Tag = <M extends Model.Model = Model.Model>(params: TagProps<M, Style>): JSX.Element => {
  return (
    <ReactTag<M, Style>
      render={(p: ITagRenderParams<Style>) => {
        return (
          <View
            className={classNames(
              "tag",
              { uppercase: params.uppercase },
              { "fill-width": params.fillWidth },
              params.className
            )}
            style={{ ...params.style, backgroundColor: params.color, color: params.textColor }}
          >
            {!isNil(params.contentRender) ? (
              params.contentRender(p)
            ) : (
              <Text className={classNames("tag-text", params.textClassName)} style={params.textStyle}>
                {params.text}
              </Text>
            )}
          </View>
        );
      }}
      {...params}
    />
  );
};

export default Tag;
