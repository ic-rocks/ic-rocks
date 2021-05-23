import type { Principal } from "@dfinity/agent";
export default interface _SERVICE {
  get_icp_to_cycles_conversion_rate: () => Promise<bigint>;
}
