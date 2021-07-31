import { useMemo, useRef, useEffect, ForwardedRef, useImperativeHandle, useState, forwardRef } from "react";
import { uniqueId, isNil } from "lodash";
import classNames from "classnames";

import EditorJS, { OutputData, API, BlockAPI, LogLevels } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import Header from "@editorjs/header";

import { convertEditorJSBlocksToInternalBlocks, convertInternalBlocksToEditorJSBlocks } from "lib/model/util";
import "./Editor.scss";
import { useDeepEqualMemo, useDynamicCallback } from "lib/hooks";

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

export type IEditorRef = {
  // readonly instance: EditorJS | null;
  readonly setValue: (value: RichText.Block[] | null) => void;
};

export type EditorProps = Readonly<Omit<EditorJS.EditorConfig, "data" | "onChange" | "tools" | "holder">> &
  Omit<StandardComponentProps, "id"> & {
    readonly value?: RichText.Block[] | null;
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
  const disableOnChange = useRef(false); // See note towards bottom of component.
  const [instance, setInstance] = useState<EditorJS | null>(null);

  const _onChange = useDynamicCallback((api: API, block: BlockAPI) => {
    if (isNil(onChange) || isNil(instance) || disableOnChange.current === true) {
      return;
    }
    instance
      .save()
      .then((data: OutputData) => {
        const internalData = convertEditorJSBlocksToInternalBlocks(data.blocks);
        const isBlocksEqual = props.onCompareBlocks?.(internalData, value || []);
        if (isBlocksEqual) {
          return;
        }
        onChange(internalData);
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
    setValue: (v: RichText.Block[] | null) => {
      const data = { blocks: !isNil(v) ? convertInternalBlocksToEditorJSBlocks(v) : [] };
      if (!isNil(instance)) {
        instance.isReady
          .then(() => {
            // We do not need the clear() method to trigger the onChange.
            disableOnChange.current = true;
            instance.clear();
            disableOnChange.current = false;
            instance.render(data);
          })
          .catch((e: Error) => {
            /* eslint-disable no-console */
            console.error(e);
          });
      }
    }
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
      onReady: _onReady
    });
    setInstance(inst);

    return () => destroyEditor();
  }, [id]);

  useEffect(() => {
    /*
    Note about EditorJS and Controlled Inputs

    With a normal input, you might use it as follows:

      const [value, setValue] = useState("")
      <Input onChange={(e: any) => setValue(e.target.value)} value={value} />

    This is called a "Controlled" component.  For this to work, it is very important
    that when `value` changes, and thus the value of `Input` updates, that the update
    due to the `value` change does not trigger `onChange` again.  If that were the case,
    we would always have an infinite loop:

    User Types in Input => onChange => setValue(newValue) => value prop to Input changes => onChange

    You can see how that would be problematic.  Unfortunately, the geniuses at
    EditorJS do not use the same methodology (methodology might be one word,
    common sense would be another).  Whenever we call `instance.render(value)`,
    it will also trigger the `onChange` hook, leading to infinite loops.  To
    avoid this, and still allow this component to work in a "Controlled" sense,
    we use a flag to prevent repetitive calls to `onChange` when the value prop
    changes.
    */
    if (!isNil(instance)) {
      instance.isReady
        .then(() => {
          const data = { blocks: !isNil(value) ? convertInternalBlocksToEditorJSBlocks(value) : [] };
          disableOnChange.current = true;
          instance.clear();
          instance.render(data);
          disableOnChange.current = false;
        })
        .catch((e: Error) => {
          /* eslint-disable no-console */
          console.error(e);
        });
    }
  }, [useDeepEqualMemo(value), !isNil(instance)]);

  return <div className={classNames("rich-text-editor", className)} id={id} style={style}></div>;
};

export default forwardRef(Editor);
