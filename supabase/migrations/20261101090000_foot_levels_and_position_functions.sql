-- Foot ability moves to a 1-6 scale and positions get safe "primary" functions.
-- Run on STAGING first. Existing foot data is converted, nothing else is touched.
--
-- Foot scale: 1 very weak, 2 weak, 3 reasonable, 4 fairly strong, 5 strong, 6 very strong.
-- The stronger foot is stored as 6; the weaker foot is 1-5. Two-footed = both feet 6.

-- ---------- 1. New foot columns on players ----------
alter table players
  add column left_foot_level  smallint check (left_foot_level  between 1 and 6),
  add column right_foot_level smallint check (right_foot_level between 1 and 6);

alter table players
  add constraint players_foot_both_or_none
  check ((left_foot_level is null) = (right_foot_level is null));

-- ---------- 2. Convert existing data (old 1-5 levels -> new 1-6 scale) ----------
-- old 1,2,3 keep their meaning; old 4 'strong' -> 5 'strong'; old 5 'very strong' -> 6.
update players p
set left_foot_level = (case foot_level(a.left_foot)
                         when 4 then 5 when 5 then 6 else foot_level(a.left_foot) end)::smallint,
    right_foot_level = (case foot_level(a.right_foot)
                         when 4 then 5 when 5 then 6 else foot_level(a.right_foot) end)::smallint
from player_attributes a
where a.player_id = p.id;

-- ---------- 3. Remove the old 1-100 foot columns ----------
drop view player_feet;
alter table player_attributes drop column left_foot, drop column right_foot;
drop function foot_level(smallint);

create or replace function foot_label(level smallint) returns text
language sql immutable as $$
  select case level
    when 1 then 'very weak' when 2 then 'weak' when 3 then 'reasonable'
    when 4 then 'fairly strong' when 5 then 'strong' else 'very strong' end $$;

-- Same columns as before, now read from players. Only players with a foot set appear.
create view player_feet with (security_invoker = true) as
select id as player_id,
       case when left_foot_level = right_foot_level then 'both'::preferred_foot
            when left_foot_level > right_foot_level then 'left'::preferred_foot
            else 'right'::preferred_foot end                       as preferred_foot,
       left_foot_level,
       foot_label(left_foot_level)                                 as left_foot_label,
       right_foot_level,
       foot_label(right_foot_level)                                as right_foot_label,
       least(left_foot_level, right_foot_level)                    as weak_foot_level,
       foot_label(least(left_foot_level, right_foot_level))        as weak_foot_label,
       greatest(left_foot_level, right_foot_level)                 as strong_foot_level,
       least(left_foot_level, right_foot_level)::text || '-' ||
       greatest(left_foot_level, right_foot_level)::text           as foot_summary
from players
where left_foot_level is not null and right_foot_level is not null;

-- ---------- 4. Publishing also needs the foot ----------
create or replace function require_player_attributes() returns trigger
language plpgsql as $$
begin
  if new.is_published then
    if not exists (select 1 from player_attributes where player_id = new.id) then
      raise exception 'cannot publish: this player has no attributes row yet';
    end if;
    if new.left_foot_level is null or new.right_foot_level is null then
      raise exception 'cannot publish: set this player''s foot first';
    end if;
  end if;
  return new;
end $$;

drop trigger players_require_attributes on players;
create trigger players_require_attributes
  before insert or update of is_published, left_foot_level, right_foot_level on players
  for each row execute function require_player_attributes();

-- ---------- 5. Positions: exactly one primary, changed atomically ----------
-- one_primary_position_per_player (partial unique index) already exists. These functions
-- swap the primary in one transaction, so a player is never left with two or none.

-- Add or update a position. The first position becomes primary automatically.
-- Updating a rating never removes the primary flag.
create or replace function save_player_position(
  p_player_id bigint, p_position position_code, p_rating smallint, p_make_primary boolean
) returns void language plpgsql as $$
declare other_primary boolean;
begin
  select exists (
    select 1 from player_positions
    where player_id = p_player_id and is_primary and position <> p_position
  ) into other_primary;

  if p_make_primary and other_primary then
    update player_positions set is_primary = false
    where player_id = p_player_id and is_primary and position <> p_position;
    other_primary := false;
  end if;

  insert into player_positions (player_id, position, rating, is_primary)
  values (p_player_id, p_position, p_rating, not other_primary)
  on conflict (player_id, position) do update
    set rating = excluded.rating,
        is_primary = player_positions.is_primary or excluded.is_primary;
end $$;

create or replace function set_primary_position(p_player_id bigint, p_position position_code)
returns void language plpgsql as $$
begin
  if not exists (select 1 from player_positions
                 where player_id = p_player_id and position = p_position) then
    raise exception 'this player does not have position %', p_position;
  end if;
  update player_positions set is_primary = false
    where player_id = p_player_id and is_primary and position <> p_position;
  update player_positions set is_primary = true
    where player_id = p_player_id and position = p_position;
end $$;

-- Remove a position. If it was the primary, the highest-rated remaining one takes over
-- (ties go to the earlier position in the list GK, LB, RB, CB ... ST).
create or replace function delete_player_position(p_player_id bigint, p_position position_code)
returns void language plpgsql as $$
declare was_primary boolean;
begin
  delete from player_positions
  where player_id = p_player_id and position = p_position
  returning is_primary into was_primary;

  if coalesce(was_primary, false) then
    update player_positions set is_primary = true
    where player_id = p_player_id
      and position = (select position from player_positions
                      where player_id = p_player_id
                      order by rating desc, position limit 1);
  end if;
end $$;

-- Only the dashboard (service role) may call these.
revoke execute on function save_player_position(bigint, position_code, smallint, boolean) from public, anon, authenticated;
revoke execute on function set_primary_position(bigint, position_code) from public, anon, authenticated;
revoke execute on function delete_player_position(bigint, position_code) from public, anon, authenticated;
grant execute on function save_player_position(bigint, position_code, smallint, boolean) to service_role;
grant execute on function set_primary_position(bigint, position_code) to service_role;
grant execute on function delete_player_position(bigint, position_code) to service_role;
