import React from "react";

export function SecondaryNav({ items }: { items: any[] }) {
  return (
    <ul className="flex gap-4 items-center py-2 px-4 mb-4 text-xs text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}
