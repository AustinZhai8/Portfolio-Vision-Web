-- Mirror of src/data/etf_data.json. The JSON file remains the source of truth
-- for decomposition logic; these tables exist for admin/audit access.

create table if not exists etf_metadata (
  ticker            text primary key,
  name              text,
  exchange          text,
  currency          text,
  description       text,
  holdings_same_as  text
);

create table if not exists etf_holdings (
  id              serial primary key,
  etf_ticker      text not null,
  holding_ticker  text not null,
  holding_name    text,
  weight          numeric
);

create index if not exists etf_holdings_etf_ticker_idx
  on etf_holdings (etf_ticker);

create table if not exists stock_info (
  ticker   text primary key,
  name     text,
  sector   text,
  country  text
);
