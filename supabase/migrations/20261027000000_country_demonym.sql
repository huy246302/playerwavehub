alter table public.countries add column demonym text;

-- Backfill common ones by ISO code; add the rest (and historical states) in the dashboard
update public.countries c
set demonym = v.d
from (values
  ('VN', 'Vietnamese'), ('BR', 'Brazilian'), ('AR', 'Argentine'),
  ('DE', 'German'),     ('FR', 'French'),    ('ES', 'Spanish'),
  ('IT', 'Italian'),    ('PT', 'Portuguese'),('NL', 'Dutch'),
  ('GB', 'British'),    ('TH', 'Thai'),      ('JP', 'Japanese'),
  ('KR', 'South Korean'), ('CN', 'Chinese'), ('US', 'American')
) as v(code, d)
where c.iso_code = v.code and c.demonym is null;