#!/bin/bash
set -euo pipefail

# Generate a test summary markdown for GitHub Actions step summary.
#
# This script creates a formatted markdown table showing test results and writes it
# to GITHUB_STEP_SUMMARY. It also exits with the original test exit code.
#
# Usage:
#   ./scripts/generate-test-summary.sh <passed> <failed> <total> <exit_code>
#
# Example:
#   ./scripts/generate-test-summary.sh 182 0 182 0

if [ $# -lt 4 ]; then
  echo "Error: Missing required arguments"
  echo "Usage: $0 <passed> <failed> <total> <exit_code>"
  exit 1
fi

PASSED="$1"
FAILED="$2"
TOTAL="$3"
EXIT_CODE="$4"

echo "### Test Results 📊" >> "$GITHUB_STEP_SUMMARY"
echo "" >> "$GITHUB_STEP_SUMMARY"

if [ "$FAILED" = "0" ] && [ "$TOTAL" != "0" ]; then
  echo "✅ **All tests passed!**" >> "$GITHUB_STEP_SUMMARY"
elif [ "$TOTAL" = "0" ]; then
  echo "⚠️ **Could not parse test results**" >> "$GITHUB_STEP_SUMMARY"
else
  echo "❌ **Some tests failed**" >> "$GITHUB_STEP_SUMMARY"
fi

echo "" >> "$GITHUB_STEP_SUMMARY"
echo "| Metric | Count |" >> "$GITHUB_STEP_SUMMARY"
echo "|--------|-------|" >> "$GITHUB_STEP_SUMMARY"
echo "| Total Tests | $TOTAL |" >> "$GITHUB_STEP_SUMMARY"
echo "| Passed | $PASSED |" >> "$GITHUB_STEP_SUMMARY"
echo "| Failed | $FAILED |" >> "$GITHUB_STEP_SUMMARY"

exit "$EXIT_CODE"