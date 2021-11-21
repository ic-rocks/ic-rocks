import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useAutoToggle(
  delay = 1000
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState(false);
  useEffect(() => {
    if (state) {
      const timeout = setTimeout(() => setState(false), delay);
      return () => clearTimeout(timeout);
    }
  }, [delay, state]);
  return [state, setState];
}
