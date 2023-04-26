import React, { ReactNode, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import { isNil } from "lodash";
import classNames from "classnames";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";

interface EditorProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly initialValue?: string;
  readonly onChange?: (html: string) => void;
  readonly onBlur?: (html: string) => void;
}

export class Editor extends React.Component {
  render() {
    return (
      <div className={"ckeditor"}>
        <h2>{"Using CKEditor 5 build in React"}</h2>
        <CKEditor
          editor={ClassicEditor}
          data={"<p>Hello from CKEditor 5!</p>"}
          onReady={editor => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            console.log({ event, editor, data });
          }}
          onBlur={(event, editor) => {
            console.log("Blur.", editor);
          }}
          onFocus={(event, editor) => {
            console.log("Focus.", editor);
          }}
        />
      </div>
    );
  }
}

export default Editor;

// export default App;

// const Editor = (
//   { initialValue, onChange, onBlur, className, style, ...props }: EditorProps,
//   ref: ForwardedRef<IEditor>
// ): ReactNode => {
//   const editor = useRef<ClassicEditor | null>(null);
//   const isInitialChange = useRef(true);

//   useEffect(() => {
//     if (!isNil(initialValue) && !isNil(editor.current)) {
//       editor.current.setData(initialValue);
//     }
//   }, [initialValue, editor.current]);

//   useImperativeHandle(ref, () => ({
//     setData: (html: string) => {
//       if (!isNil(editor.current)) {
//         editor.current.setData(html);
//       }
//     },
//     getData: () => {
//       if (!isNil(editor.current)) {
//         return editor.current.getData();
//       }
//       return "";
//     }
//   }));

//   return (
//     <div className={classNames("ckeditor", className)} style={style}>
//       <CKEditor
//         editor={ClassicEditor}
//         data={"<p>Hello from CKEditor 5!</p>"}
//         onReady={e => {
//           // You can store the "editor" and use when it is needed.
//           console.log("Editor is ready to use!", e);
//         }}
//         onChange={(event, e) => {
//           const data = editor.getData();
//           console.log({ event, e, data });
//         }}
//         onBlur={(event, e) => {
//           console.log("Blur.", e);
//         }}
//         onFocus={(event, e) => {
//           console.log("Focus.", e);
//         }}
//       />

//       {/* <CKEditor
//         {...props}
//         data={initialValue}
//         editor={ClassicEditor}
//         config={{
//           toolbar: ["heading", "|", "bold", "italic", "undo", "redo"],
//           heading: {
//             options: [
//               { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
//               { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
//               { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
//               { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
//               { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
//               { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
//               { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" }
//             ]
//           }
//         }}
//         onReady={e => (editor.current = e)}
//         onBlur={(event, e) => {
//           const html = e.getData();
//           onBlur?.(html);
//         }}
// 				onFocus={() => console.log("FOCUSED")}
//         onChange={(event, e) => {
//           if (isInitialChange.current === false) {
//             const html = e.getData();
//             onChange?.(html);
//           } else {
//             isInitialChange.current = false;
//           }
//         }}
//       /> */}
//     </div>
//   );
// };

// export default React.memo(forwardRef(Editor));
