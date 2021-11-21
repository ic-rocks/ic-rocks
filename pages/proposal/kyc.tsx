import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { BsInfoCircle } from "react-icons/bs";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import ProposalNav from "../../components/Proposals/ProposalNav";
import { DataTable } from "../../components/Tables/DataTable";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";

const KycPage = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Principal",
        accessor: (d) => d.principal.id,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            name={row.original.principal.name}
            id={value}
          />
        ),
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: (
          <>
            Ledger Accounts
            <span
              aria-label="These are accounts directly owned by a Principal. Genesis accounts control neurons, which are always owned by the Governance canister"
              data-balloon-pos="down"
              data-balloon-length="large"
            >
              <BsInfoCircle className="inline ml-1 text-xs align-middle" />
            </span>
          </>
        ),
        id: "accounts",
        accessor: (d) => d.principal.accounts[0]?.id,
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            {row.original.principal.accounts.map(({ id, name }) => (
              <div key={id} className="flex oneline">
                <IdentifierLink type="account" id={id} name={name} />
              </div>
            ))}
          </div>
        ),
        headerClassName: "px-2 flex-1",
        className: "px-2 flex-1 overflow-hidden",
      },
      {
        Header: (
          <>
            Type
            <span
              aria-label="Principals not associated with genesis accounts may be participants in the presale or other fundraising rounds"
              data-balloon-pos="down"
              data-balloon-length="large"
            >
              <BsInfoCircle className="inline ml-1 text-xs align-middle" />
            </span>
          </>
        ),
        id: "genesisAccount",
        disableSortBy: true,
        accessor: (d) => d.principal.genesisAccount?.id,
        Cell: ({ value }) =>
          value ? (
            <Link href={`/genesis/${value}`}>
              <a className="link-overflow">Genesis</a>
            </Link>
          ) : (
            "Other"
          ),
        className: "px-1 w-28",
      },
      {
        Header: "Proposal",
        id: "proposalId",
        accessor: (d) => d.proposal.id,
        sortDescFirst: true,
        Cell: ({ value }) => (
          <Link href={`/proposal/${value}`}>
            <a className="link-overflow">{formatNumber(value)}</a>
          </Link>
        ),
        className: "px-1 w-16 xs:w-24 text-right",
      },
      {
        Header: "Date",
        accessor: (d) => d.proposal.decidedDate,
        disableSortBy: true,
        Cell: ({ value }) => DateTime.fromISO(value).toLocaleString(),
        className: "pr-2 w-24 text-right hidden sm:block",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "proposalId", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy }) =>
    fetchJSON(
      "/api/principals/kyc?" +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? {
                orderBy: sortBy[0].id,
                order: sortBy[0].desc ? "desc" : "asc",
              }
            : {}),
          pageSize,
          page: pageIndex,
        })
    );

  return (
    <div className="pb-16">
      <MetaTags
        title="KYC"
        description={`A list of KYCed principals on the Internet Computer.`}
      />
      <ProposalNav />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        KYCed Principals
      </h1>
      <section className="mb-8">
        <p>The following principals have passed KYC.</p>
      </section>
      <section>
        <DataTable
          name="kyc"
          columns={columns}
          fetchData={fetchData}
          initialSortBy={initialSort}
        />
      </section>
    </div>
  );
};

export default KycPage;
