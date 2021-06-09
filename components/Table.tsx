import classNames from "classnames";
import React, { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import {
  Column,
  SortingRule,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { Pagination } from "./Pagination";

export const PAGE_SIZE = 25;

export const Table = ({
  columns,
  data,
  count,
  fetchData = () => {},
  loading,
  initialSortBy,
  manualPagination = true,
  manualSortBy = true,
}: {
  columns: Column<any>[];
  data: any[];
  count: number;
  fetchData?: ({ pageSize, pageIndex, sortBy }) => void;
  loading?: boolean;
  initialSortBy?: SortingRule<any>[];
  manualPagination?: boolean;
  manualSortBy?: boolean;
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: PAGE_SIZE, sortBy: initialSortBy },
      manualPagination,
      pageCount: Math.ceil(count / PAGE_SIZE),
      manualSortBy,
    },
    useSortBy,
    usePagination
  );

  useEffect(() => {
    fetchData({ pageIndex, pageSize, sortBy });
  }, [fetchData, pageIndex, pageSize, sortBy]);

  return (
    <div className="max-w-full overflow-x-auto">
      <table
        {...getTableProps({
          className: "table-fixed w-full",
          style: {
            minWidth: 400,
          },
        })}
      >
        <thead className="block bg-gray-100 dark:bg-gray-800 py-2">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps({
                className: "flex",
              })}
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps([
                    {
                      className: "px-2 whitespace-nowrap",
                    },
                    { className: column.className },
                    column.getSortByToggleProps(),
                  ])}
                >
                  {column.render("Header")}
                  {column.isSorted &&
                    (column.isSortedDesc ? (
                      <FaSortAmountDown className="ml-1 inline" />
                    ) : (
                      <FaSortAmountUp className="ml-1 inline" />
                    ))}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps({
            className: "block divide-y divide-gray-300 dark:divide-gray-700",
          })}
        >
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps({ className: "flex" })}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps([
                        { className: cell.column.className },
                      ])}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {count === 0 && (
            <tr
              className="flex items-center border-b border-gray-300 dark:border-gray-700"
              style={{ minHeight: "8rem" }}
            >
              <td
                colSpan={columns.length}
                className="flex-1 text-center py-2 text-xs text-gray-600 dark:text-gray-400"
              >
                {loading ? (
                  <>
                    <CgSpinner className="mr-1 inline-block animate-spin" />
                    Loading...
                  </>
                ) : (
                  "No results"
                )}
              </td>
            </tr>
          )}
          {count > 0 && (
            <tr className="flex">
              <td
                colSpan={columns.length}
                className="flex-1 text-center py-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <CgSpinner
                  className={classNames("mr-1 inline-block animate-spin", {
                    invisible: !loading,
                  })}
                />
                Showing {pageIndex * pageSize} -{" "}
                {Math.min(count, (pageIndex + 1) * pageSize)} of {count} results
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {count > 0 && (
        <div className="flex justify-center">
          <Pagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageOptions={pageOptions}
            pageCount={pageCount}
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            setPageSize={setPageSize}
            pageIndex={pageIndex}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};
