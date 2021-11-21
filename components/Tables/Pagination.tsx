import classnames from "classnames";
import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from "react-icons/fi";

export const Pagination = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageIndex,
  pageSize,
}) => {
  return (
    <div className="flex gap-x-1">
      <button
        disabled={!canPreviousPage}
        className={classnames(
          "py-0.5 px-1 bg-gray-100 dark:bg-gray-800 rounded transition-colors",
          {
            "text-gray-300 dark:text-gray-700 cursor-default": !canPreviousPage,
            "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700":
              canPreviousPage,
          }
        )}
        onClick={() => gotoPage(0)}
      >
        <FiChevronsLeft />
      </button>
      <button
        disabled={!canPreviousPage}
        className={classnames(
          "py-0.5 px-1 bg-gray-100 dark:bg-gray-800 rounded transition-colors",
          {
            "text-gray-300 dark:text-gray-700 cursor-default": !canPreviousPage,
            "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700":
              canPreviousPage,
          }
        )}
        onClick={() => previousPage()}
      >
        <FiChevronLeft />
      </button>
      <span
        className={classnames(
          "py-0.5 px-1 text-xs bg-gray-100 dark:bg-gray-800 rounded cursor-default",
          {
            "text-gray-500": pageOptions.length === 0,
          }
        )}
      >
        {pageOptions.length > 0
          ? `Page ${pageIndex + 1} of ${pageOptions.length}`
          : "No pages"}
      </span>
      <button
        disabled={!canNextPage}
        className={classnames(
          "py-0.5 px-1 bg-gray-100 dark:bg-gray-800 rounded transition-colors",
          {
            "text-gray-300 dark:text-gray-600 cursor-default": !canNextPage,
            "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700":
              canNextPage,
          }
        )}
        onClick={() => nextPage()}
      >
        <FiChevronRight />
      </button>
      <button
        disabled={!canNextPage}
        className={classnames(
          "py-0.5 px-1 bg-gray-100 dark:bg-gray-800 rounded transition-colors",
          {
            "text-gray-300 dark:text-gray-600 cursor-default": !canNextPage,
            "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700":
              canNextPage,
          }
        )}
        onClick={() => gotoPage(pageCount - 1)}
      >
        <FiChevronsRight />
      </button>
    </div>
  );
};
