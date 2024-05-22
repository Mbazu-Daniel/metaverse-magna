# Blockchain Events Tracking Service Documentation

### Introduction

This document provides an overview of the design choices and assumptions made in the implementation of the Blockchain Events Tracking Service. The service listens to Ethereum blockchain transactions and emits events to connected clients via Socket.io. Events are categorized and stored in a PostgreSQL database for further analysis.

### Problem statement:

We want to track the activities on the block for our analysis application. For this

application, we want to stream the transactions on the blockchain as they happen.

We care about the following fields:

- Sender Address

- Receiver Address

- BlockNumber

- BlockHash

- TransactionHash

- Gas Price in WEI

- Value in WEI

  

On completion, your API should be a socket.io endpoint that will allow me to subscribe to events in the following ways:

  

1. All events.

2. Only events where an address is either the sender or

receiver.

3. Only events where an address is the sender

4. Only events

where an address is the receiver

5. Assume that 1 ETH  $5,000 and send events within the ranges

  

- 0 - 100

- 100 - 500

- 500 - 2000

- 2000 - 5000

- 5000

We do not want just anyone to access our socket endpoints, so we will need a HTTP endpoint to register and log in. All requests to the socket.io endpoint will require a JWT token.




### Design Choices

1.  **Event-Driven Architecture**:
    
    -   The service uses Socket.io to provide real-time updates to connected clients. This choice enables efficient and immediate dissemination of blockchain transaction data.
2.  **Rooms in Socket.io**:
    -   Rooms are used to manage different event types. This allows clients to join specific rooms based on their  different event type, ensuring that they receive only the relevant updates.
3.  **Database Storage**:
    
    -   Transactions are stored in a PostgreSQL database using TypeORM and TypeDi for dependency injection. This ensures persistence and allows for future querying and analysis of historical data.
4.  **Event Categorization**:
    
    -   Events are categorized based on various criteria, such as whether an address is the sender or receiver and the value of the transaction. This categorization helps in filtering and analyzing the data based on specific needs.
    - 
### Assumptions
1. **Address Tracking**:

	-   It is assumed that the function aims to track transactions involving a specific address. This assumption allows the service to use the provided address to check whether it matches the sender or receiver in transactions and to emit relevant events based on this match. This enables the service to filter and categorize events effectively.
2.  **Ethereum Address Validation**:
    
    -   It is assumed that the provided address for tracking is a valid Ethereum address. This validation is done using the `ethers.utils.isAddress` method from the `ethers` library.
3.  **Value Conversion**:
    
    -   It is assumed that 1 ETH equals $5000 for the purpose of categorizing transaction values. This conversion is used to determine the value range categories.
4.  **Polling Interval**:
    
    -   The service polls the Ethereum blockchain every 10 seconds to fetch new transactions. This interval is chosen to balance between real-time updates and performance.

### Implementation Details

#### BlockchainService

-   **Methods**:
    
    -   `getLatestBlockNumber`: Fetches the latest block number from the Ethereum blockchain using JSON-RPC.
    -   `getBlockByNumber`: Fetches block details by block number, including transactions.
    -   `startListening`: Listens for new transactions, categorizes them, and emits events to clients. It also stores the transactions in the database.
-   **Event Categorization**:
    
    -   **Always**:
        -   `SOCKET_EVENTS.ALL_EVENTS`: Emitted for all transactions.
    -   **Conditional**:
        -   `SOCKET_EVENTS.SENDER_OR_RECEIVER_EVENTS`: Emitted if the address is either the sender or receiver.
        -   `SOCKET_EVENTS.SENDER_EVENTS`: Emitted if the address is the sender.
        -   `SOCKET_EVENTS.RECEIVER_EVENTS`: Emitted if the address is the receiver.
        -   **Value Ranges**:
            -   `SOCKET_EVENTS.VALUE_RANGE.RANGE_0_100`: Emitted if the transaction value is between $0 and $100.
            -   `SOCKET_EVENTS.VALUE_RANGE.RANGE_100_500`: Emitted if the transaction value is between $100 and $500.
            -   `SOCKET_EVENTS.VALUE_RANGE.RANGE_500_2000`: Emitted if the transaction value is between $500 and $2000.
            -   `SOCKET_EVENTS.VALUE_RANGE.RANGE_2000_5000`: Emitted if the transaction value is between $2000 and $5000.
            -   `SOCKET_EVENTS.VALUE_RANGE.RANGE_OVER_5000`: Emitted if the transaction value is over $5000.

### Event Emission and Storage

-   For each new transaction, the service creates a `BlockchainEvent` entity and stores it in the database.
-   Events are emitted to the corresponding Socket.io rooms based on the event type.
### Conclusion

The Blockchain Events Tracking Service is designed to provide real-time, categorized transaction data from the Ethereum blockchain. By leveraging Socket.io for real-time updates and TypeORM for database storage, the service ensures efficient data dissemination and persistence. The design choices and assumptions made aim to balance performance, real-time requirements, and ease of use.

