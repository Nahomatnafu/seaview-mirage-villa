#!/usr/bin/env bash
# End-to-end check of the deployed dashboard.
# Exercises the real preview: auth, saving rates, blocking dates, and whether
# the booking endpoint honours both.
set -u
U="https://seaview-mirage-git-admin-dashboard-nahom-atnafus-projects.vercel.app"
J=$(mktemp)   # cookie jar
PASS="$1"

fails=0
ok()  { echo "  ok    $1 ${2:-}"; }
bad() { fails=$((fails+1)); echo "  FAIL  $1 ${2:-}"; }
is()  { if [ "$2" = "$3" ]; then ok "$1" "$3"; else bad "$1" "expected $3, got $2"; fi }

code() { curl -s -m 25 -o /dev/null -w '%{http_code}' "$@"; }
body() { curl -s -m 25 "$@"; }

echo ""
echo "— public endpoints —"
is "settings is public" "$(code $U/api/settings)" "200"
S=$(body $U/api/settings)
echo "$S" | grep -q '"baseNightly":2600' && ok "settings shows \$2600/night" || bad "settings baseNightly" "$S"
is "availability is public" "$(code $U/api/availability)" "200"

echo ""
echo "— the admin routes are shut to strangers —"
for r in session settings blocks bookings; do
  c=$(code $U/api/admin/$r)
  if [ "$r" = "session" ]; then is "session answers anonymously" "$c" "200"
  else is "admin/$r refuses anonymous" "$c" "401"; fi
done
body $U/api/admin/session | grep -q '"signedIn":false' && ok "session says signed out" || bad "session shape"

echo ""
echo "— signing in —"
is "wrong password refused" "$(code -X POST -H 'Content-Type: application/json' -d '{"password":"wrong"}' $U/api/admin/login)" "401"
is "right password accepted" "$(curl -s -m 25 -c $J -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"password\":\"$PASS\"}" $U/api/admin/login)" "200"
grep -q villa_admin $J && ok "session cookie set" || bad "no session cookie"
curl -s -m 25 -b $J $U/api/admin/session | grep -q '"signedIn":true' && ok "session now valid" || bad "session not valid after login"

echo ""
echo "— reading and saving rates —"
is "settings readable when signed in" "$(curl -s -m 25 -b $J -o /dev/null -w '%{http_code}' $U/api/admin/settings)" "200"

# Overlapping seasons must be refused by the server, not just the browser.
BAD='{"baseNightly":2600,"minNights":7,"maxNights":90,"firstAvailableDate":"2026-12-10","seasons":[{"label":"A","from":"2027-12-20","to":"2027-12-28","nightly":3400},{"label":"B","from":"2027-12-25","to":"2027-12-31","nightly":3600}]}'
is "overlapping seasons refused" "$(curl -s -m 25 -b $J -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "$BAD" $U/api/admin/settings)" "400"

is "absurd rate refused" "$(curl -s -m 25 -b $J -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"baseNightly":99999999,"minNights":7,"maxNights":90,"firstAvailableDate":"2026-12-10","seasons":[]}' $U/api/admin/settings)" "400"

GOOD='{"baseNightly":2600,"minNights":7,"maxNights":90,"firstAvailableDate":"2026-12-10","seasons":[{"label":"Christmas","from":"2027-12-20","to":"2027-12-27","nightly":3400}]}'
is "a valid season saves" "$(curl -s -m 25 -b $J -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "$GOOD" $U/api/admin/settings)" "200"

sleep 12   # past the 10s per-instance cache
body $U/api/settings | grep -q '"Christmas"' && ok "the public site sees the new season" || bad "season not visible publicly"

echo ""
echo "— seasonal pricing reaches the real payment endpoint —"
# 7 nights, all inside the Christmas window: 7 x 3400 = 23,800; deposit 25% = 5,950
R=$(body -X POST -H 'Content-Type: application/json' \
  -d '{"checkIn":"2027-12-20","checkOut":"2027-12-27","instalment":"deposit","email":"e2e-season@example.com","name":"E2E Season"}' \
  $U/api/create-checkout-session)
echo "$R" | grep -q 'checkout.stripe.com' && ok "checkout session created" || bad "no checkout url" "$R"

echo ""
echo "— blocking dates takes them off sale —"
BLK=$(curl -s -m 25 -b $J -X POST -H 'Content-Type: application/json' \
  -d '{"from":"2028-03-06","to":"2028-03-13","note":"e2e test hold"}' $U/api/admin/blocks)
echo "$BLK" | grep -q '2028-03-06' && ok "block saved" || bad "block not saved" "$BLK"
BID=$(echo "$BLK" | grep -oE '"id":"[^"]+"' | tail -1 | cut -d'"' -f4)

sleep 12   # past the 10s per-instance cache
body $U/api/availability | grep -q '2028-03-06' && ok "availability shows it blocked" || bad "availability missing the block"

R2=$(body -X POST -H 'Content-Type: application/json' \
  -d '{"checkIn":"2028-03-07","checkOut":"2028-03-14","instalment":"deposit","email":"e2e-clash@example.com","name":"E2E Clash"}' \
  $U/api/create-checkout-session)
echo "$R2" | grep -qi 'already booked' && ok "booking a blocked week is refused" || bad "blocked week was NOT refused" "$R2"

echo ""
echo "— cleaning up —"
curl -s -m 25 -b $J -X DELETE -H 'Content-Type: application/json' -d "{\"id\":\"$BID\"}" $U/api/admin/blocks >/dev/null
RESET='{"baseNightly":2600,"minNights":7,"maxNights":90,"firstAvailableDate":"2026-12-10","seasons":[]}'
curl -s -m 25 -b $J -X POST -H 'Content-Type: application/json' -d "$RESET" $U/api/admin/settings >/dev/null
sleep 12   # past the 10s per-instance cache
body $U/api/settings | grep -q '"seasons":\[\]' && ok "settings restored" || bad "settings not restored"
body $U/api/availability | grep -q '2028-03-06' && bad "test block still present" || ok "test block removed"

echo ""
echo "— signing out —"
curl -s -m 25 -b $J -c $J -X POST $U/api/admin/logout >/dev/null
is "admin routes shut again after logout" "$(curl -s -m 25 -b $J -o /dev/null -w '%{http_code}' $U/api/admin/settings)" "401"

rm -f $J
echo ""
if [ $fails -eq 0 ]; then echo "ALL END-TO-END CHECKS PASSED"; else echo "$fails FAILURE(S)"; fi
exit $fails
