#!/usr/bin/env bash

set -eu

REPO_ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
SCRIPT="$REPO_ROOT/scripts/prune-legacy-codex.sh"
TARGET=$(mktemp -d "${TMPDIR:-/tmp}/codex-prune-test.XXXXXX")
trap 'rm -rf -- "$TARGET"' EXIT

mkdir -p "$TARGET/skills/gsd-help" "$TARGET/skills/diagnose" "$TARGET/skills/personal" "$TARGET/prompts"
printf old >"$TARGET/skills/gsd-help/SKILL.md"
printf old >"$TARGET/skills/diagnose/SKILL.md"
printf keep >"$TARGET/skills/personal/SKILL.md"
printf old >"$TARGET/prompts/ecc-review.md"
printf keep >"$TARGET/prompts/personal.md"

test -x "$SCRIPT"
"$SCRIPT" --target "$TARGET" --dry-run >/dev/null
test -d "$TARGET/skills/gsd-help"

"$SCRIPT" --target "$TARGET" >/dev/null
test ! -e "$TARGET/skills/gsd-help"
test ! -e "$TARGET/skills/diagnose"
test ! -e "$TARGET/prompts/ecc-review.md"
test -f "$TARGET/skills/personal/SKILL.md"
test -f "$TARGET/prompts/personal.md"
find "$TARGET/backups" -path '*/skills/gsd-help/SKILL.md' -print -quit | grep -q .
find "$TARGET/backups" -path '*/prompts/ecc-review.md' -print -quit | grep -q .

printf 'All legacy Codex pruning assertions passed\n'
