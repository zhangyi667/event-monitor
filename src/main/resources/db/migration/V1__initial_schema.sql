-- Create transfer_events table
CREATE TABLE transfer_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_address VARCHAR(42) NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value NUMERIC(78, 0) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_transfer_events_contract ON transfer_events(contract_address);
CREATE INDEX idx_transfer_events_from ON transfer_events(from_address);
CREATE INDEX idx_transfer_events_to ON transfer_events(to_address);
CREATE INDEX idx_transfer_events_block ON transfer_events(block_number);
CREATE INDEX idx_transfer_events_timestamp ON transfer_events(block_timestamp);
CREATE INDEX idx_transfer_events_created_at ON transfer_events(created_at);

-- Create composite index for address queries (from OR to)
CREATE INDEX idx_transfer_events_addresses ON transfer_events(from_address, to_address);

-- Comment on table and columns
COMMENT ON TABLE transfer_events IS 'Stores ERC20 Transfer events from monitored smart contracts';
COMMENT ON COLUMN transfer_events.contract_address IS 'Address of the ERC20 contract that emitted the event';
COMMENT ON COLUMN transfer_events.from_address IS 'Address that sent the tokens';
COMMENT ON COLUMN transfer_events.to_address IS 'Address that received the tokens';
COMMENT ON COLUMN transfer_events.value IS 'Amount of tokens transferred (in wei/smallest unit)';
COMMENT ON COLUMN transfer_events.transaction_hash IS 'Transaction hash where the event was emitted';
COMMENT ON COLUMN transfer_events.block_number IS 'Block number where the event was emitted';
COMMENT ON COLUMN transfer_events.block_timestamp IS 'Timestamp of the block';
COMMENT ON COLUMN transfer_events.created_at IS 'Timestamp when the record was created in the database';
