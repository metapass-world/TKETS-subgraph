/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address, ethereum } from '@graphprotocol/graph-ts'
// import { ERC20 } from '../types/Factory/ERC20'
// import { ERC20SymbolBytes } from '../types/Factory/ERC20SymbolBytes'
// import { ERC20NameBytes } from '../types/Factory/ERC20NameBytes'
import { User, Event, Ticket } from '../../generated/schema'
import { EventFactory as FactoryContract } from '../../generated/TKETS/EventFactory'
import { Ticket as TicketContract } from '../../generated/TKETS/Ticket'

class TicketMetadata {
  maxTickets: BigInt; 
  ticketPrice: BigInt; 
  ticketStartTime: BigInt; 
  ticketEndTime: BigInt; 
  acceptDonations: boolean;
}

class EventMetadata {
  timeStart: BigInt; 
  timeEnd: BigInt;
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0xa67E192e340fc8660D7a194af33e180A21a664dD'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertTfuelToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function convertEventIdToString(eventId: BigInt): string {
  return eventId.toHexString().slice(2)
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullTfuelValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

// export function fetchEventMetadata(eventId: BigInt): EventMetadata {
//   let eventMetadataValue = {timeStart: ZERO_BI, timeEnd: ZERO_BI} as EventMetadata
//   let eventMetadataResult = factoryContract.try_eventToMetadata(eventId)
//   if (!eventMetadataResult.reverted) {
//     eventMetadataValue = {
//       timeStart: eventMetadataResult.value.value0, 
//       timeEnd: eventMetadataResult.value.value1
//     } as EventMetadata
//   }
//   return eventMetadataValue as EventMetadata
// }

// export function fetchEventOwner(eventId: BigInt): string {
//   let eventOwnerValue = 'unknown'
//   let eventOwnerResult = factoryContract.try_eventToOwner(eventId)
//   if (!eventOwnerResult.reverted) {
//     eventOwnerValue = eventOwnerResult.value.toHexString()
//   }
//   return eventOwnerValue
// }

// export function fetchEventStatus(eventId: BigInt): boolean {
//   let eventStatusValue = false
//   let eventStatusResult = factoryContract.try_eventToStatus(eventId)
//   if (!eventStatusResult.reverted) {
//     eventStatusValue = eventStatusResult.value as boolean
//   }
//   return eventStatusValue
// }

// export function fetchTicketMetadata(ticketAddress: Address): TicketMetadata {
//   let ticketContract = TicketContract.bind(ticketAddress)

//   let ticketMetadataValue = {maxTickets: ZERO_BI, ticketPrice: ZERO_BI, ticketStartTime: ZERO_BI, ticketEndTime: ZERO_BI, acceptDonations: false} as TicketMetadata
//   let ticketMetadataResult = ticketContract.try_metadata()
//   if (!ticketMetadataResult.reverted) {
//     ticketMetadataValue = {
//       maxTickets: ticketMetadataResult.value.value0, 
//       ticketPrice: ticketMetadataResult.value.value1,
//       ticketStartTime: ticketMetadataResult.value.value2, 
//       ticketEndTime: ticketMetadataResult.value.value3, 
//       acceptDonations: ticketMetadataResult.value.value4
//     } as TicketMetadata
//   }
//   return ticketMetadataValue as TicketMetadata
// }

// export function fetchTicketURI(ticketAddress: Address): string {
//   // try types string and bytes32 for symbol
//   let ticketContract = TicketContract.bind(ticketAddress)

//   let ticketURIValue = ''
//   let ticketURIResult = ticketContract.try_baseURI()
//   if (!ticketURIResult.reverted) {
//     ticketURIValue = ticketURIResult.value
//   }
//   return ticketURIValue
// }

// export function fetchTicketSupply(ticketAddress: Address): BigInt {
//   // try types string and bytes32 for symbol
//   let ticketContract = TicketContract.bind(ticketAddress)

//   let ticketSupplyValue = ZERO_BI
//   let ticketSupplyResult = ticketContract.try_totalSupply()
//   if (!ticketSupplyResult.reverted) {
//     ticketSupplyValue = ticketSupplyResult.value
//   }
//   return ticketSupplyValue
// }

// export function fetchTokenName(tokenAddress: Address): string {
//   // static definitions overrides
//   let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
//   if(staticDefinition != null) {
//     return (staticDefinition as TokenDefinition).name
//   }

//   let contract = ERC20.bind(tokenAddress)
//   let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

//   // try types string and bytes32 for name
//   let nameValue = 'unknown'
//   let nameResult = contract.try_name()
//   if (nameResult.reverted) {
//     let nameResultBytes = contractNameBytes.try_name()
//     if (!nameResultBytes.reverted) {
//       // for broken exchanges that have no name function exposed
//       if (!isNullEthValue(nameResultBytes.value.toHexString())) {
//         nameValue = nameResultBytes.value.toString()
//       }
//     }
//   } else {
//     nameValue = nameResult.value
//   }

//   return nameValue
// }

// export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
//   let contract = ERC20.bind(tokenAddress)
//   let totalSupplyValue = null
//   let totalSupplyResult = contract.try_totalSupply()
//   if (!totalSupplyResult.reverted) {
//     totalSupplyValue = totalSupplyResult as i32
//   }
//   return BigInt.fromI32(totalSupplyValue as i32)
// }

// export function fetchTokenDecimals(tokenAddress: Address): BigInt {
//   // static definitions overrides
//   let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
//   if(staticDefinition != null) {
//     return (staticDefinition as TokenDefinition).decimals
//   }

//   let contract = ERC20.bind(tokenAddress)
//   // try types uint8 for decimals
//   let decimalValue = null
//   let decimalResult = contract.try_decimals()
//   if (!decimalResult.reverted) {
//     decimalValue = decimalResult.value
//   }
//   return BigInt.fromI32(decimalValue as i32)
// }

// export function createLiquidityPosition(exchange: Address, user: Address): LiquidityPosition {
//   let id = exchange
//     .toHexString()
//     .concat('-')
//     .concat(user.toHexString())
//   let liquidityTokenBalance = LiquidityPosition.load(id)
//   if (liquidityTokenBalance === null) {
//     let pair = Pair.load(exchange.toHexString())
//     pair.liquidityProviderCount = pair.liquidityProviderCount.plus(ONE_BI)
//     liquidityTokenBalance = new LiquidityPosition(id)
//     liquidityTokenBalance.liquidityTokenBalance = ZERO_BD
//     liquidityTokenBalance.pair = exchange.toHexString()
//     liquidityTokenBalance.user = user.toHexString()
//     liquidityTokenBalance.save()
//     pair.save()
//   }
//   if (liquidityTokenBalance === null) log.error('LiquidityTokenBalance is null', [id])
//   return liquidityTokenBalance as LiquidityPosition
// }

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    // user.ownedTokens = []
    user.save()
  }
}

// export function createLiquiditySnapshot(position: LiquidityPosition, event: EthereumEvent): void {
//   let timestamp = event.block.timestamp.toI32()
//   let bundle = Bundle.load('1')
//   let pair = Pair.load(position.pair)
//   let token0 = Token.load(pair.token0)
//   let token1 = Token.load(pair.token1)

//   // create new snapshot
//   let snapshot = new LiquidityPositionSnapshot(position.id.concat(timestamp.toString()))
//   snapshot.liquidityPosition = position.id
//   snapshot.timestamp = timestamp
//   snapshot.block = event.block.number.toI32()
//   snapshot.user = position.user
//   snapshot.pair = position.pair
//   snapshot.token0PriceUSD = token0.derivedETH.times(bundle.ethPrice)
//   snapshot.token1PriceUSD = token1.derivedETH.times(bundle.ethPrice)
//   snapshot.reserve0 = pair.reserve0
//   snapshot.reserve1 = pair.reserve1
//   snapshot.reserveUSD = pair.reserveUSD
//   snapshot.liquidityTokenTotalSupply = pair.totalSupply
//   snapshot.liquidityTokenBalance = position.liquidityTokenBalance
//   snapshot.liquidityPosition = position.id
//   snapshot.save()
//   position.save()
// }