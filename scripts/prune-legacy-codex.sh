#!/usr/bin/env bash

set -eu

TARGET=${CODEX_HOME:-"$HOME/.codex"}
MODE=apply

usage() {
  printf 'Usage: %s [--target DIR] [--dry-run]\n' "$0"
}

while test "$#" -gt 0; do
  case "$1" in
    --target)
      test "$#" -ge 2 || { usage >&2; exit 2; }
      TARGET=$2
      shift 2
      ;;
    --dry-run) MODE=dry-run; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

BACKUP_DIR="$TARGET/backups/legacy-prune-$(date +%Y%m%d-%H%M%S)"

move_to_backup() {
  source_path=$1
  test -e "$source_path" || test -L "$source_path" || return 0
  relative_path=${source_path#"$TARGET"/}
  destination="$BACKUP_DIR/$relative_path"
  if test "$MODE" = dry-run; then
    printf 'would back up and remove %s\n' "$source_path"
    return 0
  fi
  mkdir -p "$(dirname -- "$destination")"
  mv "$source_path" "$destination"
  printf 'backed up %s to %s\n' "$source_path" "$destination"
}

if test -d "$TARGET/skills"; then
  for source_path in "$TARGET"/skills/gsd-*; do
    move_to_backup "$source_path"
  done
fi

if test -d "$TARGET/prompts"; then
  for source_path in "$TARGET"/prompts/ecc-*; do
    move_to_backup "$source_path"
  done
fi

for legacy_name in diagnose grill-me to-prd to-issues; do
  move_to_backup "$TARGET/skills/$legacy_name"
done

if test "$MODE" = apply; then
  printf 'Legacy Codex cleanup complete; unrelated files were preserved.\n'
fi
