/* eslint-disable prefer-const */
import { log } from '@graphprotocol/graph-ts'
import { TicketCreate as TicketCreateV1, EventCreate, StamperAdd, StamperRemove, OwnershipTransferred, EventCancel, CommissionRateChange } from '../../generated/TKETS/EventFactory'
import { TicketCreate as TicketCreateV1_1 } from '../../generated/TKETS_v1.1/EventFactory'
import { Event, Ticket, TKETSFactory } from '../../generated/schema'
import { Ticket_v1 as TicketTemplate_v1, Ticket_v1_1 as TicketTemplate_v1_1 } from '../../generated/templates'
import {
  FACTORY_ADDRESS,
  // fetchEventMetadata,
  // fetchEventStatus,
  // fetchTicketMetadata,
  // fetchTicketSupply,
  // fetchTicketURI,
  convertEventIdToString,
  ZERO_BD,
  ZERO_BI,
} from './helpers'

export function handleEventCreate(event: EventCreate): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new TKETSFactory(FACTORY_ADDRESS)
    factory.eventCount = 0
    factory.commissionRate = ZERO_BI
    factory.totalVolumeTFUEL = ZERO_BD
    factory.totalTicketMint = ZERO_BI
    factory.totalTicketStamps = ZERO_BI
    factory.totalTicketTransfers = ZERO_BI
    factory.txCount = ZERO_BI
  }
  factory.eventCount = factory.eventCount + 1
  factory.save()

  // create the event
  let newEvent = new Event(convertEventIdToString(event.params.eventId))
  newEvent.createdAtBlockNumber = event.block.number
  newEvent.createdAtTimestamp = event.block.timestamp
  newEvent.owner = event.params.ownerAddress
  // let eventMetadata = fetchEventMetadata(event.params.eventId)
  newEvent.timeStart = event.params.timeStart
  newEvent.timeEnd = event.params.timeEnd
  newEvent.status = false

  newEvent.tradeVolume = ZERO_BD
  newEvent.txCount = ZERO_BI

  // save updated values
  newEvent.save()
  factory.save()
}

export function handleCommissionRateChange(event: CommissionRateChange): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)

  // safety check
  if (factory === null) {
    return
  }

  factory.commissionRate = event.params.newCommissionRate
  
  factory.save()
}

export function handleEventCancel(event: EventCancel): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)

  // safety check
  if (factory === null) {
    return
  }

  // create the event
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  // safety check
  if (eventSaved === null) {
    return
  }

  eventSaved.status = true

  // save updated values
  eventSaved.save()
}

export function handleStamperAdd(event: StamperAdd): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)

  // safety check
  if (factory === null) {
    return
  }

  // create the event
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  // safety check
  if (eventSaved === null) {
    return
  }

  // check if stamper is already added
  if (!eventSaved.stampers.includes(event.params.stamperAddress)) {
    eventSaved.stampers = eventSaved.stampers.concat([event.params.stamperAddress])
    // save updated values
    eventSaved.save()
  }
}

export function handleStamperRemove(event: StamperAdd): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)

  // safety check
  if (factory === null) {
    return
  }

  // create the event
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  // safety check
  if (eventSaved === null) {
    return
  }

  let stamperIndex = eventSaved.stampers.indexOf(event.params.stamperAddress)
  eventSaved.stampers = eventSaved.stampers.slice(0, stamperIndex).concat(eventSaved.stampers.slice(stamperIndex + 1));
  // eventSaved.stampers.splice(stamperIndex, 1)
  // save updated values
  eventSaved.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)

  // safety check
  if (factory === null) {
    return
  }

  // create the event
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  // safety check
  if (eventSaved === null) {
    return
  }

  eventSaved.owner = event.params.newOwner
  // save updated values
  eventSaved.save()
}

export function handleTicketCreateV1(event: TicketCreateV1): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  if (factory === null) {
    return
  }

  if (eventSaved === null) {
    return
  }

  // create the ticket
  let newTicket = new Ticket(event.params.ticketAddress.toHexString())
  newTicket.createdAtBlockNumber = event.block.number
  newTicket.createdAtTimestamp = event.block.timestamp
  newTicket.event = eventSaved.id
  // let ticketMetadata = fetchTicketMetadata(event.params.ticketAddress)
  // newTicket.maxTickets = ticketMetadata.maxTickets
  // newTicket.ticketPrice = ticketMetadata.ticketPrice
  // newTicket.ticketStartTime = ticketMetadata.ticketStartTime
  // newTicket.ticketEndTime = ticketMetadata.ticketEndTime
  // newTicket.acceptDonations = ticketMetadata.acceptDonations
  newTicket.maxTickets = event.params.maxTickets
  newTicket.ticketPrice = event.params.ticketPrice
  newTicket.ticketStartTime = event.params.ticketStartTime
  newTicket.ticketEndTime = event.params.ticketEndTime
  newTicket.acceptDonations = event.params.acceptDonations
  // newTicket.uri = fetchTicketURI(event.params.ticketAddress)
  newTicket.uri = event.params.uri
  newTicket.uriHash = event.params.uriHash
  newTicket.useTokenIDInURI = event.params.useTokenIDInURI
  newTicket.refundPrice = event.params.ticketPrice
  newTicket.allowRefunds = false
  
  // newTicket.totalSupply = fetchTicketSupply(event.params.ticketAddress)
  newTicket.totalSupply = ZERO_BI
  newTicket.balanceTfuel = ZERO_BD

  newTicket.saleVolume = ZERO_BD
  newTicket.txCount = ZERO_BI

  // create the tracked contract based on the template
  TicketTemplate_v1.create(event.params.ticketAddress)

  // save updated values
  newTicket.save()
  factory.save()
}

export function handleTicketCreateV1_1(event: TicketCreateV1_1): void {
  // load factory (create if first exchange)
  let factory = TKETSFactory.load(FACTORY_ADDRESS)
  let eventSaved = Event.load(convertEventIdToString(event.params.eventId))

  if (factory === null) {
    return
  }

  if (eventSaved === null) {
    return
  }

  // create the ticket
  let newTicket = new Ticket(event.params.ticketAddress.toHexString())
  newTicket.createdAtBlockNumber = event.block.number
  newTicket.createdAtTimestamp = event.block.timestamp
  newTicket.event = eventSaved.id
  // let ticketMetadata = fetchTicketMetadata(event.params.ticketAddress)
  // newTicket.maxTickets = ticketMetadata.maxTickets
  // newTicket.ticketPrice = ticketMetadata.ticketPrice
  // newTicket.ticketStartTime = ticketMetadata.ticketStartTime
  // newTicket.ticketEndTime = ticketMetadata.ticketEndTime
  // newTicket.acceptDonations = ticketMetadata.acceptDonations
  newTicket.maxTickets = event.params.maxTickets
  newTicket.ticketPrice = event.params.ticketPrice
  newTicket.ticketStartTime = event.params.ticketStartTime
  newTicket.ticketEndTime = event.params.ticketEndTime
  newTicket.acceptDonations = event.params.acceptDonations
  // newTicket.uri = fetchTicketURI(event.params.ticketAddress)
  newTicket.uri = event.params.uri
  newTicket.uriHash = event.params.uriHash
  newTicket.useTokenIDInURI = event.params.useTokenIDInURI
  newTicket.refundPrice = event.params.ticketPrice
  newTicket.allowRefunds = event.params.allowRefunds
  
  // newTicket.totalSupply = fetchTicketSupply(event.params.ticketAddress)
  newTicket.totalSupply = ZERO_BI
  newTicket.balanceTfuel = ZERO_BD

  newTicket.saleVolume = ZERO_BD
  newTicket.txCount = ZERO_BI

  // create the tracked contract based on the template
  TicketTemplate_v1_1.create(event.params.ticketAddress)

  // save updated values
  newTicket.save()
  factory.save()
}
