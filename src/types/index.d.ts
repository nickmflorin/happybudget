declare module "*.ttf";
declare module "classnames";
declare module "@editorjs/paragraph";
declare module "@editorjs/header";
declare module "@editorjs/table";
declare module "@editorjs/link";
declare module "@editorjs/list";
declare module "@ckeditor/ckeditor5-react" {
  import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
  import Event from "@ckeditor/ckeditor5-utils/src/eventinfo";
  import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
  import * as React from "react";

  type CKEditorProps = {
      disabled?: boolean;
      editor: typeof ClassicEditor;
      data?: string;
      id?: string;
      config?: EditorConfig;
      onReady?: (editor: ClassicEditor) => void;
      onChange?: (event: Event, editor: ClassicEditor) => void;
      onBlur?: (event: Event, editor: ClassicEditor) => void;
      onFocus?: (event: Event, editor: ClassicEditor) => void;
      onError?: (event: Event, editor: ClassicEditor) => void;
  }
  const CKEditor: React.FunctionComponent<CKEditorProps>;
  export { CKEditor, CKEditorProps, Event as CKEditorEvent, ClassicEditor as EditorInstance };
}