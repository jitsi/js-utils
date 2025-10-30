/**
 * Create a GitHub check run with test results.
 *
 * This script creates a GitHub check that displays test results on pull requests.
 * It's designed to be used with actions/github-script.
 *
 * @param {Object} params - Parameters object
 * @param {Object} params.github - GitHub API client from actions/github-script
 * @param {Object} params.context - GitHub Actions context
 * @param {string} params.passed - Number of passed tests
 * @param {string} params.failed - Number of failed tests
 * @param {string} params.total - Total number of tests
 */
module.exports = async ({ github, context, passed, failed, total }) => {
  const conclusion = failed === '0' && total !== '0' ? 'success' : (total === '0' ? 'neutral' : 'failure');
  const summary = `${total} tests run, ${passed} passed, ${failed} failed`;

  await github.rest.checks.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    name: 'Test Results',
    head_sha: context.payload.pull_request.head.sha,
    status: 'completed',
    conclusion: conclusion,
    output: {
      title: summary,
      summary: summary,
      text: `**Test Execution Summary**\n\n- Total: ${total}\n- Passed: ${passed} ✅\n- Failed: ${failed} ${failed === '0' ? '✅' : '❌'}`
    }
  });
};