import classNames from "classnames";
import { View, RichText, Label } from "components/pdf";

interface NotesProps extends StandardPdfComponentProps {
  readonly blocks?: RichText.Block[];
}

const Notes = ({ blocks, ...props }: NotesProps): JSX.Element => {
  return (
    <View {...props} className={classNames("notes", props.className)}>
      <Label>{"Notes"}</Label>
      <View className={"notes-container"}>
        <RichText className={"notes-text"} blocks={blocks || []} />
      </View>
    </View>
  );
};

export default Notes;
