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
