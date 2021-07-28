import { useMemo, useEffect, ForwardedRef, useImperativeHandle, useState, forwardRef } from "react";
import { uniqueId, isNil, filter, map } from "lodash";
import classNames from "classnames";

import EditorJS, { OutputData, API, BlockAPI, OutputBlockData, LogLevels } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import Header from "@editorjs/header";

import { partitionHtmlIntoFragments } from "lib/model/util";
import "./Editor.scss";
import { useDynamicCallback } from "lib/hooks";

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

const Tools = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: ["bold", "italic"]
  },
  header: {
    class: Header,
    inlineToolbar: ["bold", "italic"]
  }
};

type IEditorRef = {
  instance: EditorJS | null;
};

export type EditorProps = Readonly<Omit<EditorJS.EditorConfig, "data" | "onChange" | "tools" | "holder">> &
  Omit<StandardComponentProps, "id"> & {
    readonly value?: RichText.Block[];
    readonly onChange?: (blocks?: RichText.Block[] | undefined) => void;
    readonly onSaveError?: (error: Error) => void;
    readonly onReady?: (instance: EditorJS | null) => void;
    readonly onCompareBlocks?: (newBlocks: RichText.Block[], oldBlocks: RichText.Block[]) => boolean;
  };

const Editor = (
  { value, onChange, onReady, onSaveError, className, style, ...props }: EditorProps,
  ref: ForwardedRef<IEditorRef>
): JSX.Element => {
  const id = useMemo<string>(() => uniqueId("rich-text-"), []);
  const [instance, setInstance] = useState<EditorJS | null>(null);

  const _onChange = useDynamicCallback((api: API, block: BlockAPI) => {
    if (isNil(onChange) || isNil(instance)) {
      return;
    }
    instance
      .save()
      .then((data: OutputData) => {
        console.log(data.blocks);
        const internalData = convertEditorJSBlocksToInternalBlocks(data.blocks);
        const isBlocksEqual = props.onCompareBlocks?.(internalData, value || []);
        if (isBlocksEqual) {
          return;
        }
        onChange?.(internalData);
      })
      .catch((e: Error) => {
        /* eslint-disable no-console */
        console.error(e);
        onSaveError?.(e);
      });
  });

  const _onReady = useDynamicCallback(() => {
    return onReady?.(instance);
  });

  useImperativeHandle(ref, () => ({
    instance
  }));

  const destroyEditor = useDynamicCallback(() => {
    if (!isNil(instance)) {
      instance.isReady
        .then(() => {
          instance.destroy();
          setInstance(null);
        })
        .catch((e: Error) => {
          /* eslint-disable no-console */
          console.error(e);
        });
    }
  });

  useEffect(() => {
    const inst = new EditorJS({
      // I do not, for the sake of me, understand why we are getting an error that LogLevels
      // is not defined - but it would be nice to get rid of EditorJS unnecessary logging.
      logLevel: !isNil(LogLevels) ? LogLevels.ERROR : undefined,
      ...props,
      tools: Tools,
      holder: id,
      onChange: _onChange,
      onReady: _onReady,
      data: { blocks: value as OutputBlockData[] }
    });
    setInstance(inst);
    return () => destroyEditor();
  }, [id]);

  return <div className={classNames("rich-text-editor", className)} id={id} style={style}></div>;
};

export default forwardRef(Editor);
