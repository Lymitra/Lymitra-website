"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { VAULT_CONTRACT, STAKING_CONTRACT, ROUTER_CONTRACT, PAIR_CONTRACT } from "./contracts";
import { USDC_ADDRESS, WSTT_ADDRESS, activeChain } from "./chains";

const CHAIN_ID = activeChain.id;

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
    address: WSTT_ADDRESS,
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

// ─── MockUSDC faucet ─────────────────────────────────────────────────────────
const MOCK_USDC_ABI = [
  { name: "faucet", type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
] as const;

export function useUsdcFaucet() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    // Mints `usdcAmount` (human units, e.g. "1000") to the caller
    drip: (usdcAmount: string) =>
      writeContractAsync({
        address: USDC_ADDRESS,
        abi: MOCK_USDC_ABI,
        chainId: CHAIN_ID,
        functionName: "faucet",
        args: [parseUnits(usdcAmount, 6)],
      }),
    isPending,
  };
}

// ─── Write hooks ──────────────────────────────────────────────────────────────
export function useRegisterCompany() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    register: (name: string) =>
      writeContractAsync({ ...VAULT_CONTRACT, chainId: CHAIN_ID, functionName: "registerCompany", args: [name] }),
    isPending,
  };
}

// Primary deposit: send native SOMI directly to vault (no approve needed)
export function useDepositSomi() {
  const { writeContractAsync, isPending } = useWriteContract();
  return {
    depositSomi: (somiAmount: string) =>
      writeContractAsync({
        ...VAULT_CONTRACT,
        chainId: CHAIN_ID,
        functionName: "depositSomi",
        value: parseUnits(somiAmount, 18),
      }),
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
      chainId: CHAIN_ID,
      functionName: "approve",
      args: [VAULT_CONTRACT.address, parseUnits(amount, 6)],
    });

  const deposit = (amount: string) =>
    writeContractAsync({
      ...VAULT_CONTRACT,
      chainId: CHAIN_ID,
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
        chainId: CHAIN_ID,
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
        chainId: CHAIN_ID,
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
      writeContractAsync({ ...VAULT_CONTRACT, chainId: CHAIN_ID, functionName: "executePayrollManual" }),
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
        chainId: CHAIN_ID,
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
        chainId: CHAIN_ID,
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
      writeContractAsync({ ...STAKING_CONTRACT, chainId: CHAIN_ID, functionName: "claimReward" }),
    isPending,
  };
}

// ─── DEX reads ────────────────────────────────────────────────────────────────
export function usePoolReserves() {
  return useReadContract({
    ...ROUTER_CONTRACT,
    functionName: "getPoolReserves",
    args: [WSTT_ADDRESS, USDC_ADDRESS],
  });
}

export function usePairTotalSupply() {
  return useReadContract({
    ...PAIR_CONTRACT,
    functionName: "totalSupply",
  });
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
