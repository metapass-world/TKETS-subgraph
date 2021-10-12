/* eslint-disable prefer-const */
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'
import {
  Event,
  Ticket,
  TKETSFactory,
  Transaction,
  Mint as MintEvent,
  Transfer as TransferEvent,
  Stamp as StampEvent,
  TicketToken,
} from '../../generated/schema'
import { Ticket as TicketContract, TicketMint, TicketStamped, Transfer, WithdrawBalance, TicketRefund } from '../../generated/templates/Ticket/Ticket'
import { updateEventDayData, updateTKETSDayData, updateTicketHourData } from './dayUpdates'
import {
  ADDRESS_ZERO,
  FACTORY_ADDRESS,
  ONE_BI,
  createUser,
  convertTfuelToDecimal,
  ZERO_BD,
} from './helpers'

export function handleTransfer(event: Transfer): void {
  // ignore initial transfers for first adds
  if (event.params.from.toHexString() == ADDRESS_ZERO) {
    return
  }

  let transactionHash = event.transaction.hash.toHexString()

  // user stats
  let from = event.params.from
  createUser(from)
  let to = event.params.to
  createUser(to)

  // get ticket
  let ticket = Ticket.load(event.address.toHexString())
  // safety check
  if (ticket === null) {
    return
  }

  let tkets = TKETSFactory.load(FACTORY_ADDRESS)
  // safety check
  if (tkets === null) {
    return
  }
  // load Ticket Token
  let ticketToken = TicketToken.load(ticket.id.concat('#').concat(event.params.tokenId.toI32().toString()))
  // safety check
  if (ticketToken === null) {
    return
  }

  // update txn counts and sale volumn
  ticket.txCount = ticket.txCount.plus(ONE_BI)

  let eventId = ticket.event
  let eventSaved = Event.load(eventId)
  // safety check
  if (eventSaved === null) {
    return
  }

  // update txn counts
  eventSaved.txCount = eventSaved.txCount.plus(ONE_BI)
  tkets.totalTicketTransfers = tkets.totalTicketTransfers.plus(ONE_BI)
  tkets.txCount = tkets.txCount.plus(ONE_BI)

  ticket.save()
  eventSaved.save()
  tkets.save()

  // get or create transaction
  let transaction = Transaction.load(transactionHash)
  if (transaction === null) {
    transaction = new Transaction(transactionHash)
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.mints = []
    transaction.transfers = []
    transaction.stamps = []
  }

  // update ticketToken
  ticketToken.owner = to.toHexString()
  ticketToken.save()

  let transfers = transaction.transfers
  let transfer = new TransferEvent(event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(transfers.length).toString()))
  transfer.transaction = transaction.id
  transfer.ticket = ticket.id
  transfer.timestamp = transaction.timestamp
  transfer.ticketToken = ticketToken.id
  transfer.save()

  transaction.transfers = transfers.concat([transfer.id])
  transaction.save()

  // update day entities
  updateEventDayData(eventId, event)
  updateTicketHourData(event)
  updateTKETSDayData(event)
}

export function handleMint(event: TicketMint): void {
  let transactionHash = event.transaction.hash.toHexString()

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(transactionHash)
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.mints = []
    transaction.transfers = []
    transaction.stamps = []
  }

  let ticket = Ticket.load(event.address.toHex())
  // safety check
  if (ticket === null) {
    return
  }

  let tkets = TKETSFactory.load(FACTORY_ADDRESS)
  // safety check
  if (tkets === null) {
    return
  }

  // update txn counts and sale volumn
  ticket.totalSupply = ticket.totalSupply.plus(ONE_BI)
  let ticketSaleAmount = convertTfuelToDecimal(event.transaction.value)
  ticket.saleVolume = ticket.saleVolume.plus(ticketSaleAmount)
  ticket.txCount = ticket.txCount.plus(ONE_BI)
  ticket.balanceTfuel = ticket.balanceTfuel.plus(ticketSaleAmount)

  let eventId = ticket.event
  let eventSaved = Event.load(eventId)
  // safety check
  if (eventSaved === null) {
    return
  }

  // update txn counts
  eventSaved.tradeVolume = eventSaved.tradeVolume.plus(ticketSaleAmount)
  eventSaved.txCount = eventSaved.txCount.plus(ONE_BI)
  tkets.totalVolumeTFUEL = tkets.totalVolumeTFUEL.plus(ticketSaleAmount)
  tkets.totalTicketMint = tkets.totalTicketMint.plus(ONE_BI)
  tkets.txCount = tkets.txCount.plus(ONE_BI)

  // save entities
  ticket.save()
  eventSaved.save()
  tkets.save()

  // create Ticket Token
  let ticketToken = new TicketToken(ticket.id.concat('#').concat(event.params.ticketId.toI32().toString()))
  ticketToken.event = eventId
  ticketToken.ticket = ticket.id
  ticketToken.tokenID = event.params.ticketId

  let to = event.transaction.from
  createUser(to)
  ticketToken.owner = to.toHexString()
  ticketToken.stamped = false

  ticketToken.save()

  let mints = transaction.mints
  let mint = new MintEvent(event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(mints.length).toString()))
  mint.transaction = transaction.id
  mint.ticket = ticket.id
  mint.ticketToken = ticketToken.id
  mint.timestamp = transaction.timestamp
  mint.to = to
  mint.save()

  transaction.mints = mints.concat([mint.id])
  transaction.save()

  // update day entities
  updateEventDayData(eventId, event)
  updateTicketHourData(event)
  updateTKETSDayData(event)
}

export function handleStamp(event: TicketStamped): void {
  let transactionHash = event.transaction.hash.toHexString()

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(transactionHash)
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.mints = []
    transaction.transfers = []
    transaction.stamps = []
  }

  let ticket = Ticket.load(event.address.toHex())
  // safety check
  if (ticket === null) {
    return
  }

  let tkets = TKETSFactory.load(FACTORY_ADDRESS)
  // safety check
  if (tkets === null) {
    return
  }

  // load Ticket Token
  let ticketToken = TicketToken.load(ticket.id.concat('#').concat(event.params.ticketId.toI32().toString()))
  // safety check
  if (ticketToken === null) {
    return
  }

  // update txn counts and sale volumn
  ticket.txCount = ticket.txCount.plus(ONE_BI)

  let eventId = ticket.event
  let eventSaved = Event.load(eventId)
  // safety check
  if (eventSaved === null) {
    return
  }

  // update txn counts
  eventSaved.txCount = eventSaved.txCount.plus(ONE_BI)
  tkets.totalTicketStamps = tkets.totalTicketStamps.plus(ONE_BI)
  tkets.txCount = tkets.txCount.plus(ONE_BI)

  // save entities
  ticket.save()
  eventSaved.save()
  tkets.save()

  ticketToken.stamped = true
  ticketToken.save()

  let stamps = transaction.stamps
  let stamp = new StampEvent(event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(stamps.length).toString()))
  stamp.transaction = transaction.id
  stamp.ticket = ticket.id
  stamp.ticketToken = ticketToken.id
  stamp.timestamp = transaction.timestamp
  stamp.save()

  transaction.stamps = stamps.concat([stamp.id])
  transaction.save()

  // update day entities
  updateEventDayData(eventId, event)
  updateTicketHourData(event)
  updateTKETSDayData(event)
}

export function handleRefund(event: TicketRefund): void {
  let ticket = Ticket.load(event.address.toHex())
  // safety check
  if (ticket === null) {
    return
  }

  // update balance
  ticket.balanceTfuel = ticket.balanceTfuel.minus(convertTfuelToDecimal(ticket.ticketPrice))

  // save entities
  ticket.save()
}

export function handleWithdraw(event: WithdrawBalance): void {
  let ticket = Ticket.load(event.address.toHex())
  // safety check
  if (ticket === null) {
    return
  }

  // update balance
  ticket.balanceTfuel = ZERO_BD

  // save entities
  ticket.save()
}