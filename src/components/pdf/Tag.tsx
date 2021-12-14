import { Tag as ReactTag } from "components/tagging";
import classNames from "classnames";
import { isNil } from "lodash";
import { Style } from "@react-pdf/types";
import View from "./primitive/View";
import Text from "./primitive/Text";

const Tag = <M extends Model.Model = Model.Model>(params: TagProps<M, Style>): JSX.Element => {
  return (
    <ReactTag<M, Style>
      render={(p: ITagRenderParams<Style>) => {
        let style = { ...params.style };
        if (p.color !== null) {
          style = { ...style, backgroundColor: p.color };
        }
        /* Since this is not HTML, the Tag will not auto size based on the text
				   it contains - so unless we specify a rule for the Tag width, it will
				   fill up the entire cell horizontally.  This rule seems to work
				   relatively well, but might need fine tuning.

					 The border-radius is one thing that seems to cause this to not work
					 as well - so if we could figure out a way to vary the multiplier here
					 with border-radius, that would be an improvement.
					*/
        let multiplier = 4.8;
        let coeff = p.text.length / 1200.0;
        for (let i = 0; i < p.text.length; i++) {
          multiplier = multiplier + Math.max(0.02 - coeff * i * i, 0);
        }
        style = { ...style, width: multiplier * p.text.length };
        return (
          <View
            className={classNames("tag", { uppercase: p.uppercase }, { "fill-width": p.fillWidth }, p.className)}
            style={style}
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
