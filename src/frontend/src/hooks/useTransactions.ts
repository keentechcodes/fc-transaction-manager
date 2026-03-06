import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactions, postTransaction } from "../lib/api";

export function useTransactions() {
	return useQuery({
		queryKey: ["transactions"],
		queryFn: getTransactions,
	});
}

export function useAddTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: postTransaction,
		onSuccess: () => {
			return queryClient.invalidateQueries({
				queryKey: ["transactions"],
			});
		},
	});
}
