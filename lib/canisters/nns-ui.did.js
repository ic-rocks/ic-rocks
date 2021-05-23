const Service = ({ IDL }) => {
  return IDL.Service({
    get_icp_to_cycles_conversion_rate: IDL.Func([], [IDL.Nat64], ["query"]),
  });
};
export const init = ({ IDL }) => {
  return [];
};
export default Service;
