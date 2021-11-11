# TKETS Subgraph

[TKETS](https://tkets.io/) is a permissionless, decentralised NFT ticketing platform.

This subgraph dynamically tracks ticket ownership, ticket metadata, and event metadata. It tracks of the current state of TKETS contracts, and contains derived stats for things like historical data and sale volume.

## Running Locally

Please refer to the Graph Node repository for instructions.

## Key Entity Overviews

#### TKETSFactory

Contains data across all of TKETS. This entity tracks important things like total sale volume, daily sale volume, transaction count, number of events and more.

#### Event

Contains data on a specific event, such as owner, start and end times, whether it is cancelled, and which tickets it has.

#### Ticket

Contains data on a specific ticket type, such as owner, event the ticket is for, ticket sale start and end times, NFT URIs and sale volume.

#### TicketToken

Contains data on a specific ticket token, such as owner, and historical transactions performed on it.