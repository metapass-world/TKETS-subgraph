/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Event, Ticket, TKETSFactory, TicketHourData, TKETSDayData, EventDayData } from '../../generated/schema'
import { convertTfuelToDecimal, FACTORY_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI } from './helpers'

export function updateTKETSDayData(ticketSaleValue: BigDecimal, event: ethereum.Event): TKETSDayData | null {
  let tkets = TKETSFactory.load(FACTORY_ADDRESS)
  // safety check
  if (tkets === null) {
    return null
  }

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tketsDayData = TKETSDayData.load(dayID.toString())
  if (tketsDayData === null) {
    tketsDayData = new TKETSDayData(dayID.toString())
    tketsDayData.date = dayStartTimestamp
    tketsDayData.dailyVolumeTFUEL = ZERO_BD
    tketsDayData.totalVolumeTFUEL = ZERO_BD
    tketsDayData.dailyTxns = ZERO_BI
  }

  tketsDayData.txCount = tkets.txCount
  tketsDayData.totalVolumeTFUEL = tkets.totalVolumeTFUEL
  tketsDayData.eventCount = tkets.eventCount
  tketsDayData.dailyVolumeTFUEL = tketsDayData.dailyVolumeTFUEL.plus(ticketSaleValue)
  tketsDayData.dailyTxns = tketsDayData.dailyTxns.plus(ONE_BI)
  tketsDayData.save()

  return tketsDayData as TKETSDayData
}

export function updateTicketHourData(ticketSaleValue: BigDecimal, event: ethereum.Event): TicketHourData | null {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let hourTicketID = event.address
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(hourIndex).toString())
  let ticket = Ticket.load(event.address.toHexString())
  // safety check
  if (ticket === null) {
    return null
  }

  let ticketHourData = TicketHourData.load(hourTicketID)
  if (ticketHourData === null) {
    ticketHourData = new TicketHourData(hourTicketID)
    ticketHourData.hourStartUnix = hourStartUnix
    ticketHourData.ticket = event.address.toHexString()
    ticketHourData.hourlyVolume = ZERO_BD
    ticketHourData.hourlyTxns = ZERO_BI
    ticketHourData.totalSupply = ZERO_BI
    ticketHourData.balanceTfuel = ZERO_BD
    ticketHourData.saleVolume = ZERO_BD
    ticketHourData.txCount = ZERO_BI
  }

  ticketHourData.totalSupply = ticket.totalSupply
  ticketHourData.hourlyVolume = ticketHourData.hourlyVolume.plus(ticketSaleValue)
  ticketHourData.hourlyTxns = ticketHourData.hourlyTxns.plus(ONE_BI)
  ticketHourData.balanceTfuel = ticket.balanceTfuel
  ticketHourData.saleVolume = ticket.saleVolume
  ticketHourData.txCount = ticket.txCount
  ticketHourData.save()

  return ticketHourData as TicketHourData
}

export function updateEventDayData(ticketSaleValue: BigDecimal, eventId: string, event: ethereum.Event): EventDayData | null {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let dayEventID = eventId
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())
  let eventSaved = Event.load(eventId)
  // safety check
  if (eventSaved === null) {
    return null
  }

  let eventDayData = EventDayData.load(dayEventID)
  if (eventDayData === null) {
    eventDayData = new EventDayData(dayEventID)
    eventDayData.event = eventId
    eventDayData.date = dayStartTimestamp
    eventDayData.dailyTxns = ZERO_BI
    eventDayData.dailyVolume = ZERO_BD
    eventDayData.tradeVolume = ZERO_BD
    eventDayData.txCount = ZERO_BI
  }

  eventDayData.dailyVolume = eventDayData.dailyVolume.plus(ticketSaleValue)
  eventDayData.dailyTxns = eventDayData.dailyTxns.plus(ONE_BI)
  eventDayData.tradeVolume = eventSaved.tradeVolume
  eventDayData.txCount = eventSaved.txCount
  eventDayData.save()

  return eventDayData as EventDayData
}