import { Style } from "@react-pdf/types";
import classNames from "classnames";
import { isNil } from "lodash";

import { Tag as ReactTag } from "deprecated/components/tagging";

import Text from "./primitive/Text";
import View from "./primitive/View";

const Tag = <M extends Model.Model = Model.Model>(params: TagProps<M, Style>): JSX.Element => (
  <ReactTag<M, Style>
    render={(p: ITagRenderParams<Style>) => {
      let style = { ...params.style };
      if (p.color !== null) {
        style = { ...style, backgroundColor: p.color };
      }
      /* Since this is not HTML, the Tag will not auto size based on the text
				   it contains - so unless we specify a rule for the Tag width, it will
				   fill up the entire cell horizontally.  After several attempts to come
					 up with this rule - I am convinced it is not an easy task.  So for
					 now, we will just let the tag fill up the full width.
					*/
      return (
        <View
          className={classNames(
            "tag",
            { uppercase: p.uppercase },
            { "fill-width": p.fillWidth },
            p.className,
          )}
          style={style}
        >
          {!isNil(params.contentRender) ? (
            params.contentRender(p)
          ) : (
            <Text
              className={classNames("tag-text", p.textClassName)}
              style={{ ...p.textStyle, color: p.textColor }}
            >
              {p.text}
            </Text>
          )}
        </View>
      );
    }}
    {...params}
  />
);

export default Tag;
