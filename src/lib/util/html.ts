export const isNodeDescendantOf = (parent: HTMLElement | Element, child: HTMLElement | Element) => {
  var node = child.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

export const parseStyleString = (style: string): { [key: string]: string } => {
  const regex = /([\w-]*)\s*:\s*([^;]*)/g;

  const properties: { [key: string]: string } = {};

  let match = regex.exec(style);
  while (match) {
    properties[match[1]] = match[2].trim();
    match = regex.exec(style);
  }
  return properties;
};
