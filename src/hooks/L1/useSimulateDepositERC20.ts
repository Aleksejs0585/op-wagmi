'use client'

import { l1StandardBridgeABI } from '@eth-optimism/contracts-ts'
import { type SimulateDepositERC20Parameters } from 'op-viem/actions'
import { type Config, useSimulateContract, type UseSimulateContractParameters } from 'wagmi'
import type { OpConfig } from '../../types/OpConfig.js'
import type { UseSimulateOPActionBaseParameters } from '../../types/UseSimulateOPActionBaseParameters.js'
import type { UseSimulateOPActionBaseReturnType } from '../../types/UseSimulateOPActionBaseReturnType.js'
import { useOpConfig } from '../useOpConfig.js'

const ABI = l1StandardBridgeABI
const FUNCTION = 'depositERC20To'

export type UseSimulateDepositERC20Parameters<
  config extends Config = OpConfig,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
> =
  & UseSimulateOPActionBaseParameters<typeof ABI, typeof FUNCTION, config, chainId>
  // The L1CrossDomainMessenger will add the L2 gas we need, so we can pass 0 to the contract by default & make the argument optional
  & { args: Omit<Pick<SimulateDepositERC20Parameters, 'args'>['args'], 'minGasLimit'> & { minGasLimit?: number } }
  & { l2ChainId: number }

export type UseSimulateDepositERC20ReturnType<
  config extends Config = OpConfig,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
> = UseSimulateOPActionBaseReturnType<typeof ABI, typeof FUNCTION, config, chainId>

/**
 * Simulates a deposit of ERC20 tokens to L2
 * @param parameters - {@link UseSimulateDepositERC20Parameters}
 * @returns wagmi [useSimulateContract return type](https://alpha.wagmi.sh/react/api/hooks/useSimulateContract#return-type). {@link UseSimulateDepositERC20ReturnType}
 */
export function useSimulateDepositERC20<
  config extends Config = OpConfig,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
>(
  { args, l2ChainId, query, ...rest }: UseSimulateDepositERC20Parameters<config, chainId>,
): UseSimulateDepositERC20ReturnType<config, chainId> {
  const opConfig = useOpConfig(rest)
  const l2Chain = opConfig.l2chains[l2ChainId]

  if (!l2Chain) {
    throw new Error('L2 chain not configured')
  }

  return useSimulateContract({
    address: l2Chain.l1Addresses.l1StandardBridge.address,
    abi: ABI,
    functionName: FUNCTION,
    args: [args.l1Token, args.l2Token, args.to, args.amount, args.minGasLimit ?? 0, args.extraData ?? '0x'],
    chainId: l2Chain.l1ChainId,
    query: query as UseSimulateContractParameters['query'],
    ...rest,
  }) as unknown as UseSimulateDepositERC20ReturnType<config, chainId>
}
