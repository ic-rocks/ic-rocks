import Link from "next/link";
import React from "react";

const DONATION_PRINCIPAL =
  "rhdzf-56ey3-govp2-ph4xv-ptaxc-ghi2s-b6wqg-moe2m-dsfom-4atrl-tqe";

export function Footer() {
  return (
    <footer className="flex justify-between items-center py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="text-xs text-gray-500">
        © {new Date().getFullYear()} ic.rocks |{" "}
        <Link href={`/principal/${DONATION_PRINCIPAL}`}>
          <a className="link-overflow">Donate ICP or Cycles</a>
        </Link>
      </div>
    </footer>
  );
}
