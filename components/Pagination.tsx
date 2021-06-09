import classnames from "classnames";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
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
          "px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 transition-colors",
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
          "px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 transition-colors",
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
          "px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs",
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
          "px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 transition-colors",
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
          "px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 transition-colors",
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
