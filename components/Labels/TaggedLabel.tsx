import React from "react";

export function TaggedLabel({ label }: { label: string }) {
  return (
    <span
      className="rounded text-sm px-1 bg-blue-600 bg-opacity-25"
      title={label}
    >
      {label}
    </span>
  );
}
