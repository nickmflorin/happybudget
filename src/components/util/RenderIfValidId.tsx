import { ReactNode, useEffect, useState } from "react";

type ID = string | number | (string | number)[];

interface RenderIfValidIdProps {
  id: ID;
  children: ReactNode;
}

const RenderIfValidId = ({ id, children }: RenderIfValidIdProps): JSX.Element => {
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (Array.isArray(id)) {
      let _valid = true;
      const ids = id as (string | number)[];
      for (let i = 0; i < ids.length; i++) {
        if (isNaN(parseInt(ids[i] as string))) {
          _valid = false;
          break;
        }
      }
      setValid(_valid);
    } else {
      const _id = id as string;
      if (!isNaN(parseInt(_id))) {
        setValid(true);
      } else {
        setValid(false);
      }
    }
  }, [id]);

  if (valid) {
    return <>{children}</>;
  }
  return <></>;
};

export default RenderIfValidId;
