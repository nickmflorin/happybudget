declare module "*.ttf";
declare module "classnames";
declare module "@editorjs/paragraph";
declare module "@editorjs/header";
declare module "@editorjs/table";
declare module "@editorjs/link";
declare module "@editorjs/list";
declare module "@ckeditor/ckeditor5-react" {
  import BalloonEditor from "@ckeditor/ckeditor5-build-balloon";
  import Event from "@ckeditor/ckeditor5-utils/src/eventinfo";
  import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
  import * as React from "react";

  type CKEditorProps = {
      disabled?: boolean;
      editor: typeof BalloonEditor;
      data?: string;
      id?: string;
      config?: EditorConfig;
      onReady?: (editor: BalloonEditor) => void;
      onChange?: (event: Event, editor: BalloonEditor) => void;
      onBlur?: (event: Event, editor: BalloonEditor) => void;
      onFocus?: (event: Event, editor: BalloonEditor) => void;
      onError?: (event: Event, editor: BalloonEditor) => void;
  }
  const CKEditor: React.FunctionComponent<CKEditorProps>;
  export { CKEditor, CKEditorProps, Event as CKEditorEvent, BalloonEditor as EditorInstance };
}