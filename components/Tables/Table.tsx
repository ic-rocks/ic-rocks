import classNames from "classnames";
import React, { CSSProperties, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import {
  Column,
  SortingRule,
  useExpanded,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { Pagination } from "./Pagination";

export const PAGE_SIZE = 25;

export const Table = ({
  className,
  style,
  tableBodyProps = {},
  tableHeaderGroupProps = {
    className: "bg-heading py-2",
  },
  columns,
  data,
  count,
  fetchData = () => {},
  loading,
  useSort = true,
  usePage = true,
  useExpand = false,
  initialSortBy,
  manualPagination = true,
  manualSortBy = true,
  initialPageSize = PAGE_SIZE,
}: {
  className?: string;
  style?: CSSProperties;
  tableBodyProps?: any;
  tableHeaderGroupProps?: any;
  columns: Column<any>[];
  data: any[];
  count?: number;
  fetchData?: ({ pageSize, pageIndex, sortBy }) => void;
  loading?: boolean;
  useSort?: boolean;
  usePage?: boolean;
  useExpand?: boolean;
  initialSortBy?: SortingRule<any>[];
  manualPagination?: boolean;
  manualSortBy?: boolean;
  initialPageSize?: number;
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
    state: { pageIndex, pageSize, sortBy, expanded },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: initialPageSize, sortBy: initialSortBy },
      manualPagination,
      pageCount: count == undefined ? 1 : Math.ceil(count / initialPageSize),
      manualSortBy,
    },
    ...[useSort && useSortBy, useExpand && useExpanded, usePagination].filter(
      Boolean
    )
  );

  useEffect(() => {
    fetchData({ pageIndex, pageSize, sortBy });
  }, [fetchData, pageIndex, pageSize, sortBy]);

  return (
    <div className="max-w-full overflow-x-auto">
      <table
        {...getTableProps([
          {
            className: "table-fixed w-full",
            style: {
              minWidth: 320,
            },
          },
          { className, style },
        ])}
      >
        <thead className="block">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps([
                {
                  className: "flex",
                },
                tableHeaderGroupProps,
              ])}
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps([
                    {
                      className: "items-center",
                    },
                    { className: column.className },
                    { style: column.style },
                    useSort && column.getSortByToggleProps(),
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
          {...getTableBodyProps([
            {
              className: "block divide-y divide-default",
            },
            tableBodyProps,
          ])}
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
                        { style: cell.column.style },
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
          {count > 0 && (usePage || loading) && (
            // Show results count when usePage=true, but always show loading spinner
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
                {usePage &&
                  `Showing ${pageIndex * pageSize} - ${Math.min(
                    count,
                    (pageIndex + 1) * pageSize
                  )} of ${count} results`}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {usePage && count > 0 && (
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
