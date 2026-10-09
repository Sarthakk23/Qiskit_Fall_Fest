-- OPTIONAL, NOT APPLIED AUTOMATICALLY.
-- Registrations are closed. The website no longer calls these functions,
-- but they are still executable by anyone holding the public anon key.
-- Running this stops new submissions at the database level. It deletes
-- nothing: every table, row and function stays in place.
--
-- To reopen registrations, re-run the grants in the "reopen" block below.

revoke execute on function public.register_individual(text, text, text, text, text) from anon;
revoke execute on function public.create_team(text, text, text, text, text, text, text) from anon;
revoke execute on function public.join_team(text, text, text, text, text, text) from anon;
revoke execute on function public.upgrade_to_team_leader(text, text, text, text) from anon;
revoke execute on function public.upgrade_join_team(text, text, text) from anon;
revoke execute on function public.email_is_registered(text) from anon;

notify pgrst, 'reload schema';

-- reopen:
-- grant execute on function public.register_individual(text, text, text, text, text) to anon;
-- grant execute on function public.create_team(text, text, text, text, text, text, text) to anon;
-- grant execute on function public.join_team(text, text, text, text, text, text) to anon;
-- grant execute on function public.upgrade_to_team_leader(text, text, text, text) to anon;
-- grant execute on function public.upgrade_join_team(text, text, text) to anon;
-- grant execute on function public.email_is_registered(text) to anon;
