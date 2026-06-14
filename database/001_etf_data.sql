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

-- Enable RLS on all tables (blocks all access by default)
alter table etf_metadata  enable row level security;
alter table etf_holdings  enable row level security;
alter table stock_info    enable row level security;

-- Allow anyone to read (this is public reference data)
create policy "public read etf_metadata"
  on etf_metadata for select using (true);

create policy "public read etf_holdings"
  on etf_holdings for select using (true);

create policy "public read stock_info"
  on stock_info for select using (true);
