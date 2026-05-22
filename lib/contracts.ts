import { VAULT_ABI, STAKING_ABI, ROUTER_ABI, PAIR_ABI } from "./abis";

export const VAULT_ADDRESS   = process.env.NEXT_PUBLIC_VAULT_ADDRESS   as `0x${string}`;
export const STAKING_ADDRESS = process.env.NEXT_PUBLIC_AGENT_ADDRESS   as `0x${string}`;
export const ROUTER_ADDRESS  = process.env.NEXT_PUBLIC_ROUTER_ADDRESS  as `0x${string}`;
export const PAIR_ADDRESS    = process.env.NEXT_PUBLIC_PAIR_ADDRESS    as `0x${string}`;

export const VAULT_CONTRACT   = { address: VAULT_ADDRESS,   abi: VAULT_ABI   } as const;
export const STAKING_CONTRACT = { address: STAKING_ADDRESS, abi: STAKING_ABI } as const;
export const ROUTER_CONTRACT  = { address: ROUTER_ADDRESS,  abi: ROUTER_ABI  } as const;
export const PAIR_CONTRACT    = { address: PAIR_ADDRESS,    abi: PAIR_ABI    } as const;
