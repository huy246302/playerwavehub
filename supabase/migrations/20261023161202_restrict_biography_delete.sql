-- Drop the cascading foreign keys from players and coaches to biographies
-- (looked up by shape, so it works whatever the constraints are currently named)
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    where c.contype = 'f'
      and c.confrelid = 'public.biographies'::regclass
      and c.conrelid in ('public.players'::regclass, 'public.coaches'::regclass)
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

-- Re-add them so the database refuses the delete
alter table public.players
  add constraint players_biography_id_fkey
  foreign key (biography_id) references public.biographies(id) on delete restrict;

alter table public.coaches
  add constraint coaches_biography_id_fkey
  foreign key (biography_id) references public.biographies(id) on delete restrict;