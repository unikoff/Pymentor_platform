# Retired workflows

These files are historical copies, outside `.github/workflows`, so GitHub Actions does not execute them. The old shared-hosting production workflow is disabled in GitHub. Its previous bot commit author in the branches UI is historical attribution, not an active deployment binding.

Only `.github/workflows/release.yml` is active in the consolidated tree. Pushes to branch **Release** run checks/build/publish for the test VPS; main is retained and does not deploy automatically. No workflow updates the former production branch or contacts the old hosting.
