import classNames from "classnames";
import { ReactNode } from "react";

type SimpleTableRow = {
  contents: ReactNode;
  className?: string;
}[];

const SimpleTable = ({
  header,
  rows,
}: {
  header: SimpleTableRow[number];
  rows: SimpleTableRow[];
}) => {
  return (
    <table className="w-full table-fixed">
      <thead className="bg-heading">
        <tr className="flex">
          <th className={classNames(header.className, "px-2 py-2")}>
            {header.contents}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-default">
        {rows.map((row, i) => (
          <tr key={i} className="flex">
            {row.map((cell, j) => (
              <td key={j} className={classNames(cell.className, "px-2 py-2")}>
                {cell.contents}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
