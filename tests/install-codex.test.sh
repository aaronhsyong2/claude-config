#!/usr/bin/env bash

set -u

REPO_ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
INSTALLER="$REPO_ROOT/scripts/install-codex.sh"
FAILURES=0

pass() {
  printf 'ok - %s\n' "$1"
}

fail() {
  printf 'not ok - %s\n' "$1" >&2
  FAILURES=$((FAILURES + 1))
}

assert_success() {
  description=$1
  shift
  if "$@"; then
    pass "$description"
  else
    fail "$description"
  fi
}

assert_file_contains() {
  description=$1
  file=$2
  pattern=$3
  if test -f "$file" && grep -Fq -- "$pattern" "$file"; then
    pass "$description"
  else
    fail "$description"
  fi
}

assert_link_target() {
  description=$1
  link=$2
  expected=$3
  if test -L "$link" && test "$(readlink "$link")" = "$expected"; then
    pass "$description"
  else
    fail "$description"
  fi
}

new_target() {
  mktemp -d "${TMPDIR:-/tmp}/codex-sync-test.XXXXXX"
}

cleanup_targets() {
  for target in ${TEST_TARGETS:-}; do
    rm -rf -- "$target"
  done
}
trap cleanup_targets EXIT

if ! test -x "$INSTALLER"; then
  printf 'not ok - installer exists and is executable: %s\n' "$INSTALLER" >&2
  exit 1
fi

# Dry-run must describe work without creating the target or any children.
dry_target=$(new_target)
TEST_TARGETS="${TEST_TARGETS:-} $dry_target"
rmdir "$dry_target"
dry_output=$($INSTALLER --target "$dry_target" --dry-run 2>&1)
dry_status=$?
if test "$dry_status" -eq 0; then
  pass 'dry-run exits successfully'
else
  fail 'dry-run exits successfully'
fi
if test ! -e "$dry_target"; then
  pass 'dry-run performs no filesystem mutations'
else
  fail 'dry-run performs no filesystem mutations'
fi
if printf '%s\n' "$dry_output" | grep -Eqi 'would (create|link|install|update)'; then
  pass 'dry-run reports proposed changes'
else
  fail 'dry-run reports proposed changes'
fi

# Check mode reports drift but never repairs it.
check_target=$(new_target)
TEST_TARGETS="$TEST_TARGETS $check_target"
check_output=$($INSTALLER --target "$check_target" --check 2>&1)
check_status=$?
if test "$check_status" -ne 0; then
  pass 'check mode exits non-zero when managed files are missing'
else
  fail 'check mode exits non-zero when managed files are missing'
fi
if test -z "$(find "$check_target" -mindepth 1 -print -quit)"; then
  pass 'check mode performs no filesystem mutations'
else
  fail 'check mode performs no filesystem mutations'
fi
if printf '%s\n' "$check_output" | grep -Eqi '(missing|drift|out.of.sync)'; then
  pass 'check mode explains detected drift'
else
  fail 'check mode explains detected drift'
fi

# Install mode manages shared skills, command adapters, roles, and config sources.
install_target=$(new_target)
TEST_TARGETS="$TEST_TARGETS $install_target"
mkdir -p "$install_target/skills" "$install_target/agents"
printf '%s\n' 'keep me' >"$install_target/skills/personal-skill"
printf '%s\n' 'keep me too' >"$install_target/agents/personal-role.toml"
cat >"$install_target/config.toml" <<'EOF'
[mcp_servers.personal]
command = "personal-mcp"

[features]
js_repl = false
multi_agent = false

[agents]
max_concurrent_threads_per_session = 2
max_threads = 2
max_depth = 3
EOF
perl -pi -e 'chomp if eof' "$install_target/config.toml"
printf '%s\n' 'personal instructions' >"$install_target/AGENTS.md"

stale_source="$REPO_ROOT/skills/.codex-stale-test"
ln -s "$stale_source" "$install_target/skills/stale-managed"
external_source=$(mktemp -d "${TMPDIR:-/tmp}/codex-external-test.XXXXXX")
TEST_TARGETS="$TEST_TARGETS $external_source"
ln -s "$external_source" "$install_target/skills/external-link"

install_output=$($INSTALLER --target "$install_target" 2>&1)
install_status=$?
if test "$install_status" -eq 0; then
  pass 'install mode exits successfully'
else
  fail 'install mode exits successfully'
fi

assert_link_target 'shared skill is linked to its canonical repo source' \
  "$install_target/skills/tdd" "$REPO_ROOT/skills/tdd"
assert_link_target 'current shared skill inventory is installed' \
  "$install_target/skills/why" "$REPO_ROOT/skills/why"
assert_link_target 'command adapter is installed from the Codex source tree' \
  "$install_target/skills/prp-plan-team" "$REPO_ROOT/.codex/skills/prp-plan-team"
assert_link_target 'Codex agent role is installed from the tracked source' \
  "$install_target/agents/backend.toml" "$REPO_ROOT/.codex/agents/backend.toml"
for role_path in "$REPO_ROOT"/.codex/agents/*.toml; do
  role_name=${role_path##*/}
  role_name=${role_name%.toml}
  assert_file_contains "Codex agent role $role_name declares its name" \
    "$role_path" "name = \"$role_name\""
done

if test -f "$install_target/AGENTS.md" && cmp -s "$REPO_ROOT/.codex/AGENTS.md" "$install_target/AGENTS.md"; then
  pass 'tracked Codex instructions are installed exactly'
else
  fail 'tracked Codex instructions are installed exactly'
fi
assert_file_contains 'portable Codex multi-agent baseline is installed' \
  "$install_target/config.toml" 'multi_agent = true'
assert_file_contains 'domain role registry is installed' \
  "$install_target/config.toml" '[agents.backend]'
if test "$(grep -Fxc '[features]' "$install_target/config.toml")" -eq 1; then
  pass 'existing TOML feature table is merged without duplication'
else
  fail 'existing TOML feature table is merged without duplication'
fi
if test "$(grep -Ec '^multi_agent[[:space:]]*=' "$install_target/config.toml")" -eq 1 \
  && test "$(grep -Ec '^max_threads[[:space:]]*=' "$install_target/config.toml")" -eq 1 \
  && test "$(grep -Ec '^max_depth[[:space:]]*=' "$install_target/config.toml")" -eq 1 \
  && ! grep -Eq '^max_concurrent_threads_per_session[[:space:]]*=' "$install_target/config.toml"; then
  pass 'managed TOML keys replace differing values without duplication'
else
  fail 'managed TOML keys replace differing values without duplication'
fi
assert_file_contains 'existing machine-specific config is preserved' \
  "$install_target/config.toml" '[mcp_servers.personal]'

if test ! -e "$install_target/skills/stale-managed" && test ! -L "$install_target/skills/stale-managed"; then
  pass 'stale repo-managed artifacts are removed during install'
else
  fail 'stale repo-managed artifacts are removed during install'
fi
if find "$install_target/backups" -path '*/AGENTS.md' -type f -exec grep -Fq 'personal instructions' {} \;; then
  pass 'replaced Codex instructions are backed up'
else
  fail 'replaced Codex instructions are backed up'
fi
if printf '%s\n' "$install_output" | grep -Eqi 'stale-managed|stale'; then
  pass 'stale repo-managed artifacts are reported'
else
  fail 'stale repo-managed artifacts are reported'
fi
if test "$(cat "$install_target/skills/personal-skill")" = 'keep me' \
  && test "$(cat "$install_target/agents/personal-role.toml")" = 'keep me too' \
  && test -L "$install_target/skills/external-link"; then
  pass 'unrelated files and external links are not deleted'
else
  fail 'unrelated files and external links are not deleted'
fi

# A completed installation is clean according to the same read-only checker.
post_check_output=$($INSTALLER --target "$install_target" --check 2>&1)
post_check_status=$?
if test "$post_check_status" -eq 0; then
  pass 'check mode succeeds after synchronization'
else
  printf '%s\n' "$post_check_output" >&2
  fail 'check mode succeeds after synchronization'
fi

if test "$FAILURES" -ne 0; then
  printf '\n%d assertion(s) failed\n' "$FAILURES" >&2
  exit 1
fi

printf '\nAll Codex synchronization assertions passed\n'
