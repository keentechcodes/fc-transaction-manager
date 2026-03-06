import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddTransaction } from "@/hooks/useTransactions";
import { ApiError } from "@/lib/api";

const INITIAL_FORM = {
	transactionDate: "",
	accountNumber: "",
	accountHolderName: "",
	amount: "",
};

export function AddTransactionModal() {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(INITIAL_FORM);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

	const mutation = useAddTransaction();

	function resetForm() {
		setForm(INITIAL_FORM);
		setFieldErrors({});
		mutation.reset();
	}

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) {
			resetForm();
		}
	}

	function formatAccountNumber(raw: string): string {
		const digits = raw.replace(/\D/g, "").slice(0, 12);
		const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)];
		return parts.filter(Boolean).join("-");
	}

	function handleChange(field: string, value: string) {
		const formatted =
			field === "accountNumber" ? formatAccountNumber(value) : value;
		setForm((prev) => ({ ...prev, [field]: formatted }));
		setFieldErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const amount = Number.parseFloat(form.amount);

		if (Number.isNaN(amount)) {
			setFieldErrors({ amount: ["Amount must be a valid number"] });
			return;
		}

		mutation.mutate(
			{
				transactionDate: form.transactionDate,
				accountNumber: form.accountNumber,
				accountHolderName: form.accountHolderName,
				amount,
			},
			{
				onSuccess: () => {
					handleOpenChange(false);
				},
				onError: (error) => {
					if (error instanceof ApiError && error.details) {
						setFieldErrors(error.details);
					}
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>Add Transaction</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Transaction</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="transactionDate">Date</Label>
						<Input
							id="transactionDate"
							type="date"
							value={form.transactionDate}
							onChange={(e) => handleChange("transactionDate", e.target.value)}
							aria-invalid={!!fieldErrors.transactionDate}
						/>
						{fieldErrors.transactionDate?.map((msg) => (
							<p key={msg} className="text-sm text-red-600">
								{msg}
							</p>
						))}
					</div>

					<div className="space-y-2">
						<Label htmlFor="accountNumber">Account Number</Label>
						<Input
							id="accountNumber"
							placeholder="XXXX-XXXX-XXXX"
							maxLength={14}
							value={form.accountNumber}
							onChange={(e) => handleChange("accountNumber", e.target.value)}
							aria-invalid={!!fieldErrors.accountNumber}
						/>
						{fieldErrors.accountNumber?.map((msg) => (
							<p key={msg} className="text-sm text-red-600">
								{msg}
							</p>
						))}
					</div>

					<div className="space-y-2">
						<Label htmlFor="accountHolderName">Account Holder Name</Label>
						<Input
							id="accountHolderName"
							value={form.accountHolderName}
							onChange={(e) =>
								handleChange("accountHolderName", e.target.value)
							}
							aria-invalid={!!fieldErrors.accountHolderName}
						/>
						{fieldErrors.accountHolderName?.map((msg) => (
							<p key={msg} className="text-sm text-red-600">
								{msg}
							</p>
						))}
					</div>

					<div className="space-y-2">
						<Label htmlFor="amount">Amount</Label>
						<Input
							id="amount"
							type="number"
							step="0.01"
							value={form.amount}
							onChange={(e) => handleChange("amount", e.target.value)}
							aria-invalid={!!fieldErrors.amount}
						/>
						{fieldErrors.amount?.map((msg) => (
							<p key={msg} className="text-sm text-red-600">
								{msg}
							</p>
						))}
					</div>

					{mutation.error &&
						!(mutation.error instanceof ApiError && mutation.error.details) && (
							<p className="text-sm text-red-600">{mutation.error.message}</p>
						)}

					<Button
						type="submit"
						className="w-full"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Saving..." : "Save Transaction"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
