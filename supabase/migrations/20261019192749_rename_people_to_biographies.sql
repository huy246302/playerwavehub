alter table public.people rename to biographies;-- 1. Columns that point at biographies
alter table public.players        rename column person_id to biography_id;
alter table public.coaches        rename column person_id to biography_id;
alter table public.person_sources rename column person_id to biography_id;

-- 2. Link table
alter table public.person_sources rename to biography_sources;

-- 3. Constraint and index names (cosmetic, skips any that don't exist)
do $$
declare r record;
begin
  for r in select * from (values
    ('biographies',        'people_birth_country_id_fkey',        'biographies_birth_country_id_fkey'),
    ('biographies',        'people_nationality_id_fkey',          'biographies_nationality_id_fkey'),
    ('biographies',        'people_created_by_fkey',              'biographies_created_by_fkey'),
    ('biographies',        'people_updated_by_fkey',              'biographies_updated_by_fkey'),
    ('players',            'players_person_id_fkey',              'players_biography_id_fkey'),
    ('players',            'players_person_id_key',               'players_biography_id_key'),
    ('coaches',            'coaches_person_id_fkey',              'coaches_biography_id_fkey'),
    ('coaches',            'coaches_person_id_key',               'coaches_biography_id_key'),
    ('biography_sources',  'person_sources_pkey',                 'biography_sources_pkey'),
    ('biography_sources',  'person_sources_person_id_fkey',       'biography_sources_biography_id_fkey'),
    ('biography_sources',  'person_sources_source_id_fkey',       'biography_sources_source_id_fkey')
  ) as t(tbl, old_name, new_name)
  loop
    if exists (select 1 from pg_constraint where conname = r.old_name) then
      execute format('alter table public.%I rename constraint %I to %I',
                     r.tbl, r.old_name, r.new_name);
    end if;
  end loop;
end $$;