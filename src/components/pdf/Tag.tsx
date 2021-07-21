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
            className={classNames("tag", { uppercase: p.uppercase }, { "fill-width": p.fillWidth }, p.className)}
            style={{ ...params.style, backgroundColor: p.color }}
          >
            {!isNil(params.contentRender) ? (
              params.contentRender(p)
            ) : (
              <Text className={classNames("tag-text", p.textClassName)} style={{ ...p.textStyle, color: p.textColor }}>
                {p.text}
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
