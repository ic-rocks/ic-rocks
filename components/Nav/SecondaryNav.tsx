import React from "react";

export function SecondaryNav({ items }: { items: any[] }) {
  return (
    <ul className="px-4 py-2 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 mb-4 bg-gray-100 dark:bg-gray-950 text-xs text-gray-900 dark:text-gray-100">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}
