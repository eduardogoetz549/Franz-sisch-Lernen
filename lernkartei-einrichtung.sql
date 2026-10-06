-- Im Supabase SQL Editor ausführen. Bestehende Premium-Funktionen bleiben erhalten.
create table if not exists public.fr_flashcard_decks (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null,
 name text not null,
 cards jsonb not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,id),
 check(jsonb_typeof(cards)='array')
);
alter table public.fr_flashcard_decks enable row level security;
revoke all on public.fr_flashcard_decks from anon, authenticated;
grant select on public.fr_flashcard_decks to authenticated;
drop policy if exists "Eigene Lernkarteien lesen" on public.fr_flashcard_decks;
create policy "Eigene Lernkarteien lesen" on public.fr_flashcard_decks for select to authenticated using(user_id=auth.uid());
create or replace function public.fr_save_flashcard_deck(p_id text,p_name text,p_cards jsonb)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); a jsonb; old_cards jsonb; n integer; c jsonb;
begin
 if u is null then raise exception 'Bitte zuerst anmelden.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||':flashcards',0));
 if p_id is null or length(p_id)>100 or p_id!~'^[a-zA-Z0-9_-]+$' or p_name is null or length(trim(p_name))<1 or length(p_name)>200 or p_cards is null or jsonb_typeof(p_cards)!='array' then raise exception 'Ungültiges Kartenset.'; end if;
 n:=jsonb_array_length(p_cards);
 if n<1 then raise exception 'Füge mindestens eine Karte hinzu.'; end if;
 for c in select value from jsonb_array_elements(p_cards) loop
  if jsonb_typeof(c)!='object' or jsonb_typeof(c->'front')!='string' or jsonb_typeof(c->'back')!='string' or coalesce(length(trim(c->>'front')),0) not between 1 and 2000 or coalesce(length(trim(c->>'back')),0) not between 1 and 2000 then raise exception 'Ungültige Lernkarte.'; end if;
 end loop;
 a:=public.fr_premium_access(u,false,null);
 select cards into old_cards from public.fr_flashcard_decks where user_id=u and id=p_id;
 if not coalesce((a->>'premium')::boolean,false) then
  if old_cards is null and (select count(*) from public.fr_flashcard_decks where user_id=u)>=3 then raise exception 'Kostenlos sind maximal 3 Karteien möglich. Weitere Karteien gehören zu Premium.'; end if;
  if n>30 and (old_cards is null or n>jsonb_array_length(old_cards)) then raise exception 'Kostenlos sind maximal 30 Karten pro Kartei möglich. Bestehende Karten bleiben erhalten.'; end if;
 end if;
 insert into public.fr_flashcard_decks(user_id,id,name,cards) values(u,p_id,trim(p_name),p_cards)
 on conflict(user_id,id) do update set name=excluded.name,cards=excluded.cards,updated_at=now();
end $$;
create or replace function public.fr_delete_flashcard_deck(p_id text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'Bitte zuerst anmelden.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':flashcards',0));
 delete from public.fr_flashcard_decks where user_id=auth.uid() and id=p_id;
end $$;
revoke all on function public.fr_save_flashcard_deck(text,text,jsonb) from public,anon;
revoke all on function public.fr_delete_flashcard_deck(text) from public,anon;
grant execute on function public.fr_save_flashcard_deck(text,text,jsonb),public.fr_delete_flashcard_deck(text) to authenticated;
