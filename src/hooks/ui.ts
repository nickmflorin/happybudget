import { useRef, useEffect, useState } from "react";
import { isNil } from "lodash";

const createRootElement = (id: string | number): HTMLElement => {
  const rootContainer = document.createElement("div");
  rootContainer.setAttribute("id", String(id));
  return rootContainer;
};

const addRootElement = (rootElem: Element): void => {
  if (!isNil(document.body.lastElementChild)) {
    document.body.insertBefore(rootElem, document.body.lastElementChild.nextElementSibling);
  }
};

/**
 * https://www.jayfreestone.com/writing/react-portals-with-hooks/
 */
export const usePortalReference = (id: string | number) => {
  const rootElemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const existingParent = document.querySelector(`#${id}`);
    const parentElem = existingParent || createRootElement(id);

    if (!existingParent) {
      addRootElement(parentElem);
    }
    // Add the detached element to the parent
    if (!isNil(rootElemRef.current)) {
      parentElem.appendChild(rootElemRef.current);
    }

    return () => {
      if (!isNil(rootElemRef.current)) {
        rootElemRef.current.remove();
        if (!parentElem.childElementCount) {
          parentElem.remove();
        }
      }
    };
  }, [id]);

  /**
   * It's important we evaluate this lazily:
   * - We need first render to contain the DOM element, so it shouldn't happen
   *   in useEffect. We would normally put this in the constructor().
   * - We can't do 'const rootElemRef = useRef(document.createElement('div))',
   *   since this will run every single render (that's a lot).
   * - We want the ref to consistently point to the same DOM element and only
   *   ever run once.
   * @link https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
   */
  const getRootElem = () => {
    if (!rootElemRef.current) {
      rootElemRef.current = document.createElement("div");
    }
    return rootElemRef.current;
  };

  return getRootElem();
};

/**
 * Hook to create a React Portal.
 * Automatically handles creating and tearing-down the root elements (no SRR
 * makes this trivial), so there is no need to ensure the parent target already
 * exists.
 *
 * @example
 * const target = usePortal(id, [id]);
 * return createPortal(children, target);
 *
 * @param {String | number} id  The id of the target container.
 * @returns {HTMLElement}       The DOM node to use as the Portal target.
 */
export const usePortal = (id: string | number) => {
  const [parent, setParent] = useState<Element | null>(null);

  useEffect(() => {
    const existingParent = document.querySelector(`#${id}`);
    const parentElem = existingParent || createRootElement(id);
    setParent(parentElem);

    return () => {
      if (!parentElem.childElementCount) {
        parentElem.remove();
      }
    };
  }, [id]);

  return parent;
};
