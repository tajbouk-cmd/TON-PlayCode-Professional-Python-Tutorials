name: 🐞 Bug Report
description: Report a reproducible bug or issue in the project
title: "[Bug] <short description>"
labels: [bug, needs-review]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        👋 Thanks for reporting a bug! Please fill out the form below so we can investigate and fix it.

  - type: input
    id: environment
    attributes:
      label: Environment
      description: What browser, device, or emulator are you using?
      placeholder: "e.g. Chrome on Android, Bluestacks on Windows"

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: What happened?
      placeholder: "Describe the issue clearly and concisely."

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should have happened instead?
      placeholder: "Describe the correct behavior you expected."

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce the bug?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots or Logs
      description: If applicable, add screenshots or error logs to help explain the issue.

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other information that might help us understand or fix the issue?

  - type: markdown
    attributes:
      value: |
        🔒 If your report involves a security vulnerability, please refer to [SECURITY.md](../../SECURITY.md) and contact the maintainer privately.
