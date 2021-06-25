import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { MetaTags } from "../../components/MetaTags";
import ProposalNav from "../../components/Proposals/ProposalNav";
import { Table } from "../../components/Tables/Table";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";
import { KycsResponse } from "../../lib/types/API";

const KycPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<KycsResponse>({
    count: 0,
    rows: [],
  });

  const columns = useMemo(
    () => [
      {
        Header: "Principal",
        accessor: (d) => d.principal.id,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <Link href={`/principal/${value}`}>
            <a className="link-overflow">
              {row.original.principal.name || value}
            </a>
          </Link>
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
              <BsInfoCircle className="ml-1 inline text-xs align-middle" />
            </span>
          </>
        ),
        id: "accounts",
        accessor: (d) => d.principal.accounts[0]?.id,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <div className="flex flex-col">
            {row.original.principal.accounts.map(({ id, name }) => (
              <div key={id} className="flex oneline">
                <Link href={`/account/${id}`}>
                  <a className="link-overflow">{name || id}</a>
                </Link>
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
              <BsInfoCircle className="ml-1 inline text-xs align-middle" />
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

  const fetchData = useCallback(async ({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    const res = await fetchJSON(
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
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);

  return (
    <div className="pb-16">
      <MetaTags
        title="KYC"
        description={`A list of KYCed principals on the Internet Computer.`}
      />
      <ProposalNav />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        KYCed Principals
      </h1>
      <section className="mb-8">
        <p>The following principals have passed KYC.</p>
      </section>
      <section>
        <Table
          name="kyc"
          columns={columns}
          data={rows}
          count={count}
          fetchData={fetchData}
          loading={isLoading}
          initialSortBy={initialSort}
        />
      </section>
    </div>
  );
};

export default KycPage;
