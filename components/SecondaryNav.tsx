import React from "react";

export function SecondaryNav({ items }: { items: any[] }) {
  return (
    <nav className="flex justify-center py-4 mb-4 border-b border-t border-gray-200 dark:border-gray-800">
      <div className="flex sm:flex-row flex-col items-stretch justify-between sm:max-w-screen-lg w-full">
        <ul className="flex items-center gap-4">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
