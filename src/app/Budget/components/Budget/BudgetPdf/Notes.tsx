import classNames from "classnames";
import { View, RichText, Label } from "components/pdf";

interface NotesProps extends StandardPdfComponentProps {
  readonly nodes: Pdf.HTMLNode[];
}

const Notes = ({ nodes, ...props }: NotesProps): JSX.Element => {
  return (
    <View {...props} className={classNames("notes", props.className)}>
      <Label>{"Notes"}</Label>
      <View className={"notes-container"}>
        <RichText className={"notes-text"} nodes={nodes || []} />
      </View>
    </View>
  );
};

export default Notes;
