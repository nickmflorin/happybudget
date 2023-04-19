import classNames from "classnames";

import { View, RichText, Label } from "deprecated/components/pdf";

interface NotesProps extends Pdf.StandardComponentProps {
  readonly nodes: Pdf.HTMLNode[];
}

const Notes = ({ nodes, ...props }: NotesProps): JSX.Element => (
  <View {...props} className={classNames("notes", props.className)}>
    <Label>Notes</Label>
    <View className="notes-container">
      <RichText className="notes-text" nodes={nodes || []} />
    </View>
  </View>
);

export default Notes;
