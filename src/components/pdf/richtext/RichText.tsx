import { isNil, map, includes, filter } from "lodash";

import * as typeguards from "lib/model/typeguards";

import { View } from "../primitive";
import Paragraph from "./Paragraph";
import Heading from "./Heading";

interface RichTextProps extends StandardPdfComponentProps {
  readonly blocks: RichText.Block[] | RichText.Block;
}

const RichText = ({ blocks, ...props }: RichTextProps): JSX.Element => {
  return (
    <View {...props}>
      {filter(
        map(Array.isArray(blocks) ? blocks : [blocks], (block: RichText.Block, index: number): JSX.Element | null => {
          // Note: We aren't 100% comfortable/familiar with how the data from EditorJS
          // comes in yet, so we are using an abundance of caution to prevent runtime
          // errors.
          if (typeguards.isParagraphBlock(block) || typeguards.isHeadingBlock(block)) {
            if (!isNil(block.data.text) && typeof block.data.text !== "string") {
              /* eslint-disable no-console */
              console.error(`Block has unsupported text: ${block.data.text}.`);
              return null;
            }
            if (typeguards.isParagraphBlock(block)) {
              return <Paragraph key={index} block={block} />;
            } else {
              let headerLevel = block.data.level || 2;
              if (!includes([1, 2, 3, 4, 5, 6], headerLevel)) {
                console.error(`Unsupported header level ${headerLevel}... defaulting to h2.`);
                headerLevel = 2;
              }
              return <Heading key={index} block={block} />;
            }
          } else {
            // Note that we have not yet built in support for the list type.
            /* eslint-disable no-console */
            console.error(`Unsupported block type: ${block.type}.`);
            return null;
          }
        }),
        (element: JSX.Element | null) => !isNil(element)
      )}
    </View>
  );
};

export default RichText;
