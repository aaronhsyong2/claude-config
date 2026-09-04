#!/usr/bin/env bash

set -eu

REPO_ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
TARGET=${CODEX_HOME:-"$HOME/.codex"}
MODE=install

usage() {
  printf 'Usage: %s [--target DIR] [--dry-run|--check]\n' "$0"
}

while test "$#" -gt 0; do
  case "$1" in
    --target)
      test "$#" -ge 2 || { usage >&2; exit 2; }
      TARGET=$2
      shift 2
      ;;
    --dry-run) MODE=dry-run; shift ;;
    --check) MODE=check; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

SKILLS_DIR="$TARGET/skills"
AGENTS_DIR="$TARGET/agents"
DRIFT=0
BACKUP_DIR=

report_drift() {
  DRIFT=1
  if test "$MODE" = dry-run; then
    printf 'would %s\n' "$1"
  else
    printf 'drift: %s\n' "$1"
  fi
}

backup_path() {
  path_to_backup=$1
  if test -z "$BACKUP_DIR"; then
    BACKUP_DIR="$TARGET/backups/claude-config-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
  fi
  relative_path=${path_to_backup#"$TARGET"/}
  backup_target="$BACKUP_DIR/$relative_path"
  mkdir -p "$(dirname -- "$backup_target")"
  mv "$path_to_backup" "$backup_target"
  printf 'backed up %s to %s\n' "$path_to_backup" "$backup_target"
}

ensure_link() {
  source_path=$1
  target_path=$2
  if test -L "$target_path" && test "$(readlink "$target_path")" = "$source_path"; then
    return
  fi
  report_drift "link $target_path -> $source_path"
  if test "$MODE" != install; then
    return 0
  fi
  if test -e "$target_path" || test -L "$target_path"; then
    backup_path "$target_path"
  fi
  ln -s "$source_path" "$target_path"
}

ensure_file() {
  source_path=$1
  target_path=$2
  if test -f "$target_path" && cmp -s "$source_path" "$target_path"; then
    return
  fi
  report_drift "install $target_path"
  if test "$MODE" != install; then
    return 0
  fi
  if test -e "$target_path" || test -L "$target_path"; then
    backup_path "$target_path"
  fi
  cp "$source_path" "$target_path"
}

is_managed_skill() {
  skill_name=$1
  test -d "$REPO_ROOT/skills/$skill_name" || test -d "$REPO_ROOT/.codex/skills/$skill_name"
}

check_stale_links() {
  if ! test -d "$SKILLS_DIR"; then
    return 0
  fi
  for link_path in "$SKILLS_DIR"/*; do
    test -L "$link_path" || continue
    link_target=$(readlink "$link_path")
    case "$link_target" in
      "$REPO_ROOT/skills/"*|"$REPO_ROOT/.codex/skills/"*)
        skill_name=${link_path##*/}
        if ! is_managed_skill "$skill_name"; then
          report_drift "remove stale managed link $link_path"
          if test "$MODE" = install; then
            unlink "$link_path"
          fi
        fi
        ;;
    esac
  done
}

ensure_config() {
  baseline="$REPO_ROOT/.codex/config.toml"
  target_config="$TARGET/config.toml"
  if ! test -f "$target_config"; then
    report_drift "install $target_config"
    if test "$MODE" = install; then
      cp "$baseline" "$target_config"
    fi
    return 0
  fi
  ensure_table_key_absent "$target_config" '[agents]' 'max_threads'
  ensure_table_key_absent "$target_config" '[agents]' 'max_depth'
  ensure_table_key "$target_config" '[features]' 'multi_agent = true'
  ensure_table_key "$target_config" '[agents]' 'max_concurrent_threads_per_session = 6'

  for role_name in backend database docs frontend test code-reviewer comment-analyzer pr-test-analyzer silent-failure-hunter type-design-analyzer code-simplifier; do
    if grep -Fq "[agents.$role_name]" "$target_config"; then
      continue
    fi
    report_drift "register Codex role $role_name in $target_config"
    test "$MODE" = install || continue
    printf '\n' >>"$target_config"
    awk -v section="[agents.$role_name]" '
      $0 == section { printing = 1 }
      printing && $0 ~ /^\[/ && $0 != section { exit }
      printing { print }
    ' "$baseline" >>"$target_config"
  done
}

ensure_table_key_absent() {
  config_path=$1
  table_header=$2
  key_name=$3
  if ! awk -v header="$table_header" -v key="$key_name" '
    /^\[/ { in_table = ($0 == header) }
    in_table && $0 ~ "^[[:space:]]*" key "[[:space:]]*=" { found = 1 }
    END { exit(found ? 0 : 1) }
  ' "$config_path"; then
    return 0
  fi
  report_drift "remove legacy $key_name from $table_header in $config_path"
  test "$MODE" = install || return 0
  temp_config=$(mktemp "${TMPDIR:-/tmp}/codex-config.XXXXXX")
  awk -v header="$table_header" -v key="$key_name" '
    /^\[/ { in_table = ($0 == header) }
    in_table && $0 ~ "^[[:space:]]*" key "[[:space:]]*=" { next }
    { print }
  ' "$config_path" >"$temp_config"
  mv "$temp_config" "$config_path"
}

ensure_table_key() {
  config_path=$1
  table_header=$2
  key_line=$3
  key_name=${key_line%% *}
  if awk -v header="$table_header" -v desired="$key_line" '
    /^\[/ { in_table = ($0 == header) }
    in_table && $0 == desired { found = 1 }
    END { exit(found ? 0 : 1) }
  ' "$config_path"; then
    return 0
  fi
  report_drift "set $key_line under $table_header in $config_path"
  test "$MODE" = install || return 0
  temp_config=$(mktemp "${TMPDIR:-/tmp}/codex-config.XXXXXX")
  awk -v header="$table_header" -v key="$key_name" -v setting="$key_line" '
    function emit_setting() {
      if (in_table && !written) {
        print setting
        written = 1
      }
    }
    /^\[/ {
      emit_setting()
      in_table = ($0 == header)
      if (in_table) {
        saw_table = 1
        written = 0
      }
      print
      next
    }
    in_table && $0 ~ "^[[:space:]]*" key "[[:space:]]*=" {
      if (!written) {
        print setting
        written = 1
      }
      next
    }
    { print }
    END {
      emit_setting()
      if (!saw_table) {
        print ""
        print header
        print setting
      }
    }
  ' "$config_path" >"$temp_config"
  mv "$temp_config" "$config_path"
}

if test "$MODE" = install; then
  mkdir -p "$SKILLS_DIR" "$AGENTS_DIR"
fi

for source_path in "$REPO_ROOT"/skills/* "$REPO_ROOT"/.codex/skills/*; do
  test -d "$source_path" || continue
  ensure_link "$source_path" "$SKILLS_DIR/${source_path##*/}"
done

for source_path in "$REPO_ROOT"/.codex/agents/*.toml; do
  test -f "$source_path" || continue
  ensure_link "$source_path" "$AGENTS_DIR/${source_path##*/}"
done

ensure_file "$REPO_ROOT/.codex/AGENTS.md" "$TARGET/AGENTS.md"
ensure_config
check_stale_links

if test "$MODE" = check && test "$DRIFT" -ne 0; then
  exit 1
fi

if test "$MODE" = install; then
  printf 'Codex configuration synchronized at %s\n' "$TARGET"
fi

exit 0
