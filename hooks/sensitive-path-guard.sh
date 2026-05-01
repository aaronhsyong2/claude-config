#!/bin/bash
# Sensitive Path Guard — PreToolUse hook
# Blocks writes to sensitive paths (.env, .ssh, credentials, etc.)
# Action: BLOCK — prevents the tool call from executing

# Read tool input from stdin
INPUT=$(cat)

# Extract file path from the tool input
FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

# If no file_path found, try alternate key names
if [ -z "$FILE" ]; then
  FILE=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

# If still no file found, allow (non-file operation)
if [ -z "$FILE" ]; then
  exit 0
fi

# Blocked patterns
BLOCKED_PATTERNS=(
  ".env"
  ".ssh"
  ".aws"
  "credentials"
  "id_rsa"
  "id_ed25519"
  ".git/hooks"
  ".npmrc"
  ".pypirc"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$FILE" == *"$pattern"* ]]; then
    echo "BLOCK: Write to sensitive path denied: $FILE (matched pattern: $pattern)"
    exit 2
  fi
done

exit 0
