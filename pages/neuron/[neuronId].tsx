import { DateTime } from "luxon";
import React, { useMemo } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { useQuery } from "react-query";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { TimestampLabel } from "../../components/Labels/TimestampLabel";
import { MetaTags } from "../../components/MetaTags";
import { NeuronLabel } from "../../components/Neurons/NeuronLabel";
import Search404 from "../../components/Search404";
import SimpleTable from "../../components/Tables/SimpleTable";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";
import { formatPercent, isNumber } from "../../lib/strings";
import { Neuron } from "../../lib/types/API";
import { NeuronState } from "../../lib/types/governance";

const MAX_DISSOLVE_DELAY_SECONDS = 252_460_800;
const MAX_NEURON_AGE_FOR_AGE_BONUS = 126_230_400;

export async function getServerSideProps({ params }) {
  const { neuronId } = params;
  const isValid = !!neuronId && isNumber(neuronId);
  return { props: { isValid, neuronId } };
}

const NeuronIdPage = ({
  isValid,
  neuronId,
}: {
  isValid: boolean;
  neuronId: string;
}) => {
  if (!isValid) {
    return <Search404 input={neuronId} />;
  }

  const { data } = useQuery<Neuron>(["neurons", neuronId], () =>
    fetchJSON(`/api/neurons/${neuronId}`)
  );

  const summaryRows = useMemo(() => {
    let createdDate,
      dissolveDate,
      dissolveDateRelative,
      dissolveBonus,
      agingSinceDate,
      ageBonus;
    if (data) {
      if (data.createdDate) {
        createdDate = DateTime.fromISO(data.createdDate);
        if (createdDate.toMillis() === 0) {
          createdDate = null;
        }
      }
      dissolveDate = DateTime.fromISO(data.dissolveDate);
      dissolveDateRelative = dissolveDate.diffNow().toMillis();
      dissolveBonus =
        Math.min(
          MAX_DISSOLVE_DELAY_SECONDS,
          Math.abs(dissolveDateRelative / 1e3)
        ) / MAX_DISSOLVE_DELAY_SECONDS;
      agingSinceDate = DateTime.fromISO(data.agingSinceDate);
      ageBonus =
        Math.min(
          MAX_NEURON_AGE_FOR_AGE_BONUS,
          Math.abs(agingSinceDate.diffNow().toMillis() / 1e3)
        ) /
        (4 * MAX_NEURON_AGE_FOR_AGE_BONUS);
    }

    return [
      [
        { contents: "Name", className: "w-32" },
        {
          contents: data?.name || "-",
        },
      ],
      [
        { contents: "Account", className: "w-32" },
        {
          contents: data ? (
            data.accountId ? (
              <IdentifierLink type="account" id={data.accountId} />
            ) : (
              <span className="text-gray-500">
                Unknown{" "}
                <span
                  aria-label="Neuron accounts are not public, and can not always be linked."
                  data-balloon-pos="down"
                  data-balloon-length="medium"
                >
                  <BsInfoCircle className="ml-1 inline text-xs align-middle" />
                </span>
              </span>
            )
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Neuron Status", className: "w-32" },
        {
          contents: data ? (
            <NeuronLabel state={data.state}>
              {NeuronState[data.state]}
            </NeuronLabel>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Created", className: "w-32" },
        {
          contents: createdDate ? <TimestampLabel dt={createdDate} /> : "-",
        },
      ],
      [
        { contents: "Aging Since", className: "w-32" },
        {
          contents: data?.agingSinceDate ? (
            <>
              <TimestampLabel dt={agingSinceDate} />
              {!!data.votingPower && (
                <span className="ml-4 text-green-500">
                  +{formatPercent(ageBonus)} vote power
                </span>
              )}
            </>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Dissolve Date", className: "w-32" },
        {
          contents: data ? (
            data.state === NeuronState.Dissolved ||
            data.state === NeuronState.Donated ? (
              "-"
            ) : dissolveDateRelative < 0 ? (
              "Dissolvable now"
            ) : (
              <>
                <TimestampLabel dt={dissolveDate} />
                {!!data.votingPower && (
                  <span className="ml-4 text-green-500">
                    +{formatPercent(dissolveBonus)} vote power
                  </span>
                )}
              </>
            )
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Staked ICP", className: "w-32" },
        {
          contents: data ? <BalanceLabel value={data.stake} /> : "-",
        },
      ],
      [
        { contents: "Voting Power", className: "w-32" },
        {
          contents: data ? (
            data.votingPower ? (
              `${formatNumber(Number(data.votingPower) / 1e8)} ×10⁸`
            ) : (
              <span className="text-gray-500">
                Dissolve date {"<"} 6 months, no voting power
              </span>
            )
          ) : (
            "-"
          ),
        },
      ],
    ];
  }, [data]);

  const headers = [{ contents: "Neuron Details" }];

  return (
    <div className="pb-16">
      <MetaTags
        title={`Neuron ${neuronId}`}
        description={`Details for Neuron ${neuronId} on the Internet Computer ledger.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Neuron <small className="text-xl break-all">{neuronId}</small>
      </h1>
      <section className="mb-8">
        <SimpleTable headers={headers} rows={summaryRows} />
      </section>
    </div>
  );
};

export default NeuronIdPage;
