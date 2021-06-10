import classNames from "classnames";
import { TransactionType } from "../../lib/types/API";

export function TransactionTypeLabel({ type }: { type: TransactionType }) {
  const label = type[0] + type.slice(1).toLowerCase();
  return (
    <span
      className={classNames({
        "text-red-500": type === "BURN",
        "text-green-500": type === "MINT",
      })}
    >
      {label}
    </span>
  );
}
