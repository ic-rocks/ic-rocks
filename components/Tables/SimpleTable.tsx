import classNames from "classnames";
import { CSSProperties, ReactNode } from "react";

type SimpleTableRow = {
  contents: ReactNode;
  className?: string;
  style?: CSSProperties;
}[];

const SimpleTable = ({
  headers,
  rows,
}: {
  headers?: SimpleTableRow;
  rows: SimpleTableRow[];
}) => {
  return (
    <table className="w-full table-fixed">
      {headers && (
        <thead className="bg-heading">
          <tr className="flex">
            {headers.map((header, i) => (
              <th key={i} className={classNames(header.className, "px-2 py-2")}>
                {header.contents}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-default">
        {rows.map((row, i) => (
          <tr key={i} className="flex flex-wrap">
            {row.map((cell, j) => (
              <td
                key={j}
                className={classNames(cell.className, "px-2 py-2")}
                style={cell.style}
              >
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
