import React from "react";

export function TaggedLabel({ label }: { label: string }) {
  return (
    <span
      className="px-1 text-sm bg-blue-600 bg-opacity-25 rounded"
      title={label}
    >
      {label}
    </span>
  );
}
