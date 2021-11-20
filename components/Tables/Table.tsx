import classNames from "classnames";
import { useAtom } from "jotai";
import React, { CSSProperties, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import MultiSelect from "react-multi-select-component";
import {
  Column,
  Filters,
  SortingRule,
  useExpanded,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { atomWithLocalStorage } from "../../lib/atoms/atomWithLocalStorage";
import ClientOnly from "../ClientOnly";
import { Pagination } from "./Pagination";

const STORAGE_KEY = "tables";
export const tablesAtom = atomWithLocalStorage(STORAGE_KEY, {});

export const PAGE_SIZE = 25;

export function SelectColumnFilter({
  column: { filterValue, setFilter, filterOptions },
}) {
  return (
    <select
      className="flex-1 p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
      onChange={(e) => setFilter(e.target.value)}
      value={filterValue}
      style={{ minWidth: "8rem" }}
    >
      {filterOptions.map(([name, value]) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}

export function MultiSelectColumnFilter({
  column: { filterValue, setFilter, filterOptions, filterLabel },
}) {
  return (
    <MultiSelect
      labelledBy=""
      className="flex-1 text-xs"
      onChange={setFilter}
      value={filterValue || []}
      disableSearch={true}
      options={filterOptions}
      valueRenderer={(selected) =>
        selected.length
          ? `${filterLabel}: ${selected.length} selected`
          : `${filterLabel}: Select...`
      }
    />
  );
}

export type CommonTableProps = {
  name?: string;
  className?: string;
  style?: CSSProperties;
  tableBodyProps?: unknown;
  tableHeaderGroupProps?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Column<any>[];
  useSort?: boolean;
  /** If true, we pass in pre-sorted data */
  manualSortBy?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSortBy?: SortingRule<any>[];
  usePage?: boolean;
  manualPagination?: boolean;
  initialPageSize?: number;
  useExpand?: boolean;
  useFilter?: boolean;
  manualFilters?: boolean;
  /** If true, the table's filter and sort state will be saved in localstorage and restored on load */
  persistState?: boolean;
};

type TableProps = CommonTableProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  count?: number;

  /** Notify parent on page, sort, or filter change */
  onStateChange?: ({
    pageSize,
    pageIndex,
    sortBy,
    filters,
  }: {
    pageSize: number;
    pageIndex: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortBy: SortingRule<any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: Filters<any>;
  }) => void;
  loading?: boolean;
};

/** Table should only be rendered client-side so localStorage is available */
export const Table = (props: TableProps) => {
  return (
    <ClientOnly>
      <TableInner {...props} />
    </ClientOnly>
  );
};

export const TableInner = ({
  name,
  className,
  style,
  tableBodyProps = {},
  tableHeaderGroupProps = {
    className: "bg-heading py-2",
  },
  columns,
  data,
  count,
  onStateChange,
  loading,
  useSort = true,
  manualSortBy = true,
  initialSortBy,
  usePage = true,
  manualPagination = true,
  initialPageSize = PAGE_SIZE,
  useExpand = false,
  useFilter = false,
  manualFilters = true,
  persistState = false,
}: TableProps) => {
  // Create the atom here so localStorage is defined
  const [tableState, setTableState] = useAtom(tablesAtom);
  const savedTableState = tableState[name];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    allColumns,
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
    state: { pageIndex, pageSize, sortBy, filters },
  } = useTable(
    {
      columns,
      data,
      initialState: savedTableState || {
        pageSize: initialPageSize,
        sortBy: initialSortBy,
      },
      manualPagination,
      pageCount: count == undefined ? 1 : Math.ceil(count / initialPageSize),
      manualSortBy,
      manualFilters,
    },
    ...[
      useFilter && useFilters,
      useSort && useSortBy,
      useExpand && useExpanded,
      usePagination,
    ].filter(Boolean)
  );

  useEffect(() => {
    if (persistState) {
      if (!name) {
        console.warn(`persistState=${persistState} but no name specified`);
        return;
      }

      setTableState((s) => ({
        ...s,
        [name]: { pageIndex, pageSize, sortBy, filters },
      }));
    }
    if (onStateChange) {
      onStateChange({ pageIndex, pageSize, sortBy, filters });
    }
  }, [pageIndex, pageSize, sortBy, filters]);

  return (
    <div className="overflow-x-auto xs:overflow-x-visible max-w-full">
      {useFilter && (
        <div className="flex flex-wrap gap-1 py-2">
          {allColumns.map((column) =>
            column.canFilter && column.Filter
              ? column.render("Filter", { key: column.id })
              : null
          )}
        </div>
      )}
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
              key={headerGroup.id}
              {...headerGroup.getHeaderGroupProps([
                {
                  className: "flex",
                },
                tableHeaderGroupProps,
              ])}
            >
              {headerGroup.headers
                .filter((c) => !c.hidden)
                .map((column) => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps([
                      {
                        className: "items-center",
                      },
                      { className: column.headerClassName || column.className },
                      { style: column.style },
                      useSort && column.getSortByToggleProps(),
                    ])}
                  >
                    {column.render("Header")}
                    {column.isSorted &&
                      (column.isSortedDesc ? (
                        <FaSortAmountDown className="inline ml-1" />
                      ) : (
                        <FaSortAmountUp className="inline ml-1" />
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
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr key={row.id} {...row.getRowProps({ className: "flex" })}>
                {row.cells
                  .filter((c) => !c.column.hidden)
                  .map((cell) => {
                    return (
                      <td
                        key={cell.row.id + cell.column.id}
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
                className="flex-1 py-2 text-xs text-center text-gray-600 dark:text-gray-400"
              >
                {loading ? (
                  <>
                    <CgSpinner className="inline-block mr-1 animate-spin" />
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
                className="flex-1 py-2 text-xs text-center text-gray-600 dark:text-gray-400"
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
