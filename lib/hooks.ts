"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { VAULT_CONTRACT, STAKING_CONTRACT } from "./contracts";
import { USDC_ADDRESS, WETH_ADDRESS } from "./chains";

const ERC20_ABI = [
  { name: "approve",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "allowance",   type: "function", stateMutability: "view",       inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "balanceOf",   type: "function", stateMutability: "view",       inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

// ─── Company / Vault reads ────────────────────────────────────────────────────
export function useCompany(address?: `0x${string}`) {
  return useReadContract({
    ...VAULT_CONTRACT,
    functionName: "getCompany",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useEmployees(company?: `0x${string}`) {
  return useReadContract({
    ...VAULT_CONTRACT,
    functionName: "getEmployees",
    args: company ? [company] : undefined,
    query: { enabled: !!company },
  });
}

export function useMonthlyPayroll(company?: `0x${string}`) {
  return useReadContract({
    ...VAULT_CONTRACT,
    functionName: "monthlyPayroll",
    args: company ? [company] : undefined,
    query: { enabled: !!company },
  });
}

export function useVaultBalance() {
  return useReadContract({
    ...VAULT_CONTRACT,
    functionName: "vaultBalance",
  });
}

export function useUsdcBalance(address?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useWethBalance(address?: `0x${string}`) {
  return useReadContract({
    address: WETH_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useUsdcAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, VAULT_CONTRACT.address] : undefined,
    query: { enabled: !!owner },
  });
}

// ─── Staking reads ────────────────────────────────────────────────────────────
export function useStakeOf(address?: `0x${string}`) {
  return useReadContract({
    ...STAKING_CONTRACT,
    functionName: "stakeOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function usePendingReward(address?: `0x${string}`) {
  return useReadContract({
    ...STAKING_CONTRACT,
    functionName: "pendingReward",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTotalStaked() {
  return useReadContract({
    ...STAKING_CONTRACT,
    functionName: "totalStaked",
  });
}

export function useUnlockTime(address?: `0x${string}`) {
  return useReadContract({
    ...STAKING_CONTRACT,
    functionName: "unlockTime",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ─── Write hooks ──────────────────────────────────────────────────────────────
export function useRegisterCompany() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    register: (name: string) =>
      writeContractAsync({ ...VAULT_CONTRACT, functionName: "registerCompany", args: [name] }),
    isPending,
  };
}

// Two-step deposit: approve USDC → deposit into vault
export function useDeposit() {
  const { writeContractAsync, isPending } = useWriteContract();

  const approve = (amount: string) =>
    writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [VAULT_CONTRACT.address, parseUnits(amount, 6)],
    });

  const deposit = (amount: string) =>
    writeContractAsync({
      ...VAULT_CONTRACT,
      functionName: "deposit",
      args: [parseUnits(amount, 6)],
    });

  return { approve, deposit, isPending };
}

export function useAddEmployee() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    addEmployee: (wallet: `0x${string}`, salaryUsdc: string, name: string) =>
      writeContractAsync({
        ...VAULT_CONTRACT,
        functionName: "addEmployee",
        args: [wallet, parseUnits(salaryUsdc, 6), name],
      }),
    isPending,
  };
}

export function useSchedulePayroll() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    schedule: (dateMs: bigint) =>
      writeContractAsync({
        ...VAULT_CONTRACT,
        functionName: "schedulePayroll",
        args: [dateMs],
      }),
    isPending,
  };
}

export function useExecutePayrollManual() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    execute: () =>
      writeContractAsync({ ...VAULT_CONTRACT, functionName: "executePayrollManual" }),
    isPending,
  };
}

// ─── Staking writes ───────────────────────────────────────────────────────────
export function useStake() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    stake: (sttAmount: string) =>
      writeContractAsync({
        ...STAKING_CONTRACT,
        functionName: "stake",
        value: parseUnits(sttAmount, 18),
      }),
    isPending,
  };
}

export function useUnstake() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    unstake: (amount: string) =>
      writeContractAsync({
        ...STAKING_CONTRACT,
        functionName: "unstake",
        args: [parseUnits(amount, 18)],
      }),
    isPending,
  };
}

export function useClaimReward() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    claim: () =>
      writeContractAsync({ ...STAKING_CONTRACT, functionName: "claimReward" }),
    isPending,
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export function fmtUsdc(raw?: bigint): string {
  if (raw === undefined) return "—";
  return "$" + Number(formatUnits(raw, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtStt(raw?: bigint): string {
  if (raw === undefined) return "—";
  return Number(formatUnits(raw, 18)).toLocaleString("en-US", { maximumFractionDigits: 4 });
}
