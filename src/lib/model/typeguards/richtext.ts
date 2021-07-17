export const isParagraphBlock = (block: RichText.Block): block is RichText.ParagraphBlock => {
  return (block as RichText.ParagraphBlock).type === "paragraph";
};

export const isHeadingBlock = (block: RichText.Block): block is RichText.HeadingBlock => {
  return (block as RichText.HeadingBlock).type === "header";
};

export const isListBlock = (block: RichText.Block): block is RichText.ListBlock => {
  return (block as RichText.ListBlock).type === "list";
};
