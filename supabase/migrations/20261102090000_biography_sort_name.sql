-- Lets lists sort players and head coaches by the name that is shown ("Pelé", not
-- "Edson Arantes do Nascimento"): the display name if there is one, otherwise the full name.
-- Additive: one computed column and an index. Nothing is changed or removed.
alter table biographies
  add column sort_name text
  generated always as (coalesce(nullif(btrim(display_name), ''), full_name)) stored;

create index biographies_sort_name_idx on biographies (sort_name);
