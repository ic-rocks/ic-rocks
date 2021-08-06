import { useQuery } from "react-query";
import fetchJSON from "../fetch";
import { SubnetResponse } from "../types/API";

export default function useSubnets() {
  return useQuery<SubnetResponse[]>(
    "subnets",
    () => fetchJSON("/api/subnets"),
    {
      staleTime: Infinity,
      placeholderData: [],
    }
  );
}
