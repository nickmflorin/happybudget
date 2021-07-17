import { useMemo } from "react";
import EditorJs from "react-editor-js";
import { Props as EditorJSProps } from "react-editor-js";
import { API, OutputBlockData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import classNames from "classnames";
import { isNil, uniqueId, map, filter } from "lodash";

import { partitionHtmlIntoFragments } from "lib/model/util";

import "./RichText.scss";

type EditorJSBlockConverter<T extends string, D extends object = any> = (
  original: OutputBlockData<T, D>
) => RichText.Block;

const IdentityConverter = <B extends RichText.Block>(original: OutputBlockData): B => ({ ...original } as B);

/* eslint-disable no-unused-vars */
const BlockTypeConverters: { [key in RichText.BlockType]: EditorJSBlockConverter<any> } = {
  list: IdentityConverter,
  header: IdentityConverter,
  paragraph: (original: OutputBlockData<"paragraph", { text: string }>): RichText.ParagraphBlock => {
    const fragments = partitionHtmlIntoFragments(original.data.text);
    return {
      ...original,
      data: fragments.length === 0 ? fragments[0] : { children: fragments }
    };
  }
};

const convertEditorJSBlocksToInternalBlocks = (blocks: OutputBlockData[]): RichText.Block[] => {
  return filter(
    map(blocks, (block: OutputBlockData) => {
      if (isNil(BlockTypeConverters[block.type as RichText.BlockType])) {
        /* eslint-disable no-console */
        console.error(`Unsupported block type ${block.type}!`);
        return null;
      } else {
        return BlockTypeConverters[block.type as RichText.BlockType](block);
      }
    }),
    (block: RichText.Block | null) => !isNil(block)
  ) as RichText.Block[];
};

type RichTextProps = Omit<EditorJSProps, "onChange" | "data" | "holder"> &
  StandardComponentProps & {
    readonly onChange?: (blocks?: RichText.Block[] | undefined) => void;
    readonly value?: OutputBlockData[];
  };

const RichText: React.FC<RichTextProps> = ({ onChange, value, className, style, ...props }) => {
  const id = useMemo<string>(() => uniqueId("rich-text-"), []);
  return (
    <EditorJs
      {...props}
      data={!isNil(value) ? { blocks: value } : undefined}
      holder={id}
      tools={{
        paragraph: {
          inlineToolbar: ["bold", "italic"]
        },
        header: {
          class: Header,
          inlineToolbar: ["bold", "italic"]
        }
      }}
      onChange={(api: API, d?: any) =>
        onChange?.(!isNil(d) ? convertEditorJSBlocksToInternalBlocks(d.blocks) : undefined)
      }
    >
      <div className={classNames("rich-text", className)} style={style} id={id}></div>
    </EditorJs>
  );
};

export default RichText;
