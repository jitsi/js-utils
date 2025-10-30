#!/bin/bash
set -euo pipefail

# Parse test results from web-test-runner output and export to GitHub Actions output.
#
# This script extracts test result counts (passed/failed/total) from the test output log
# and writes them to GITHUB_OUTPUT for use in subsequent workflow steps.
#
# Usage:
#   ./.github/workflows/scripts/parse-test-results.sh <test-output-log-file>
#
# Example:
#   npm run test:coverage 2>&1 | tee test-output.log
#   ./.github/workflows/scripts/parse-test-results.sh test-output.log

if [ $# -lt 1 ]; then
  echo "Error: Missing required argument"
  echo "Usage: $0 <test-output-log-file>"
  exit 1
fi

TEST_OUTPUT_LOG="$1"

if [ ! -f "$TEST_OUTPUT_LOG" ]; then
  echo "Error: Test output log file not found: $TEST_OUTPUT_LOG"
  exit 1
fi

# Extract test results from web-test-runner output
# Format: "Chrome: |████| 7/7 test files | 182 passed, 0 failed"
if grep -q "passed" "$TEST_OUTPUT_LOG"; then
  PASSED=$(grep -oP '\d+ passed' "$TEST_OUTPUT_LOG" | tail -1 | grep -oP '\d+' || echo "0")
  FAILED=$(grep -oP '\d+ failed' "$TEST_OUTPUT_LOG" | tail -1 | grep -oP '\d+' || echo "0")
  TOTAL=$((PASSED + FAILED))

  echo "passed=$PASSED" >> "$GITHUB_OUTPUT"
  echo "failed=$FAILED" >> "$GITHUB_OUTPUT"
  echo "total=$TOTAL" >> "$GITHUB_OUTPUT"

  echo "✅ Parsed test results: $PASSED passed, $FAILED failed (total: $TOTAL)"
else
  echo "passed=0" >> "$GITHUB_OUTPUT"
  echo "failed=0" >> "$GITHUB_OUTPUT"
  echo "total=0" >> "$GITHUB_OUTPUT"

  echo "⚠️  Could not parse test results from $TEST_OUTPUT_LOG"
fi
