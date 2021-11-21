import React from "react";
import AccountDetails from "../../components/Accounts/AccountDetails";
import { MetaTags } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import { isAccount } from "../../lib/strings";

export async function getServerSideProps({ params }) {
  const { accountId: accountId_ } = params;
  const accountId = accountId_?.toLowerCase();
  const isValid = !!accountId && isAccount(accountId);
  return {
    props: { accountId, isValid },
  };
}

const AccountPage = ({
  isValid,
  accountId,
}: {
  isValid: boolean;
  accountId: string;
}) => {
  if (!isValid) {
    return <Search404 input={accountId} />;
  }

  return (
    <div className="pb-16">
      <MetaTags
        title={`Account ${accountId}`}
        description={`Details for account ${accountId} on the Internet Computer ledger.`}
      />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        Account <small className="text-xl break-all">{accountId}</small>
      </h1>
      <AccountDetails accountId={accountId} />
    </div>
  );
};

export default AccountPage;
