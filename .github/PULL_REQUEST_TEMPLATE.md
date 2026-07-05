## Summary

<!-- Briefly describe the change in 1-3 sentences. -->

## Type of Change

<!-- Check the relevant option(s). -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactor / chore (no functional change)
- [ ] New feed source
- [ ] Public instance registration (HOSTS)

## Related Issue

<!-- Link the issue this PR fixes, e.g. `Closes #123` or `Fixes #123`. Delete this section if there is no related issue. -->

## Changes

<!-- Describe the implementation in detail. List the key files and the reasoning behind non-obvious decisions. -->

- ...
- ...

## Screenshots / Examples

<!-- If applicable, add screenshots, sample URLs, or example feed outputs to help reviewers. -->

## Checklist

<!-- Confirm each item before requesting review. -->

- [ ] I have read the [CONTRIBUTING.md](CONTRIBUTING.md) guide.
- [ ] My code follows the project's naming conventions (`slug`, paths, handler rules).
- [ ] I have run `bun run check` locally (TypeScript + Biome) and it passes.
- [ ] I have run `bun test ./pkgs/rssbook/src/tests` and added/updated tests where relevant.
- [ ] If this is a new feed source, I have registered it in the correct category file under `src/routers/feeds/`.
- [ ] If this adds a public instance, I have followed the `HOSTS` CSV format and the instance is publicly accessible over HTTPS.
- [ ] I have updated relevant documentation (README, docs/, JSDoc).

## Additional Context

<!-- Anything else reviewers should know: backwards-incompatible changes, follow-up work, performance impact, etc. -->
