import React, { useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import { isNil } from "lodash";
import classNames from "classnames";
import { CKEditor, CKEditorProps, CKEditorEvent, EditorInstance } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { ckeditor } from "lib";

interface EditorProps extends Omit<CKEditorProps, "editor" | "config" | "onChange" | "data"> {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly initialValue?: string;
  readonly onChange?: (html: string) => void;
  readonly onDataChange?: (data: Pdf.HTMLNode[] | null) => void;
}

const Editor = (
  { initialValue, onChange, onDataChange, className, style, ...props }: EditorProps,
  ref: ForwardedRef<IEditor>
): JSX.Element => {
  const editor = useRef<EditorInstance | null>(null);

  useEffect(() => {
    if (!isNil(initialValue) && !isNil(editor.current)) {
      editor.current.setData(initialValue);
    }
  }, [initialValue, editor.current]);

  useImperativeHandle(ref, () => ({
    setData: (html: string) => {
      if (!isNil(editor.current)) {
        editor.current.setData(html);
      }
    },
    getData: () => {
      if (!isNil(editor.current)) {
        return editor.current.getData();
      }
      return "";
    }
  }));

  return (
    <div className={classNames("ckeditor", className)} style={style}>
      <CKEditor
        {...props}
        data={initialValue}
        editor={ClassicEditor}
        config={{
          toolbar: ["heading", "|", "bold", "italic", "undo", "redo"],
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
              { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
              { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" }
            ]
          }
        }}
        onReady={(e: EditorInstance) => (editor.current = e)}
        onChange={(event: CKEditorEvent, e: EditorInstance) => {
          const html = e.getData();
          onChange?.(html);
          if (!isNil(onDataChange)) {
            const data = ckeditor.parsers.convertHtmlIntoNodes(html);
            onDataChange(data);
          }
        }}
      />
    </div>
  );
};

export default React.memo(forwardRef(Editor));
