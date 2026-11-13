---
title: "Astro dev runs in the background when an AI agent is detected"
summary: "Astro 7 moves the dev server to the background when an AI agent is detected."
date: 2026-11-14
topic: astro
icon: code
tags: ["Astro"]
tldr: "Astro 7 runs `astro dev` in the background when it detects an AI agent. Manage that server with `status`, `logs`, and `stop`, or turn this mode off with `ASTRO_DEV_BACKGROUND=0`."
---

When Astro detects an AI agent, `astro dev` runs as a background process. Since v7.2.0, `astro preview` runs in the background too. The server does not block the agent's terminal, so the agent keeps working.

This mode applies on macOS and Linux. On Windows, the server stays in the foreground.

Astro records the server in `.astro/dev.json`. The file holds the server's URL, port, and PID.

In this mode, the `astro dev` command exits right away, but the server keeps running. A tool that waits for that command, such as Playwright's `webServer`, can misread its state.

## Managing the background server

These commands manage the background server:

- `pnpm astro dev status` shows the URL, PID, and uptime.
- `pnpm astro dev logs` prints the logs. This command works only for a server started in the background. Add `--follow` to stream new lines.
- `pnpm astro dev stop` sends SIGTERM and waits up to 5 seconds. If the server is still running, Astro sends SIGKILL.

The dev server also exposes the `/_astro/status` endpoint, which returns `{"ok": true}`. Agents and tools can use it to check whether the server is ready to accept requests.

## The `--ignore-lock` flag

The `--ignore-lock` flag skips the lock file check and write. A new server can run alongside one that is already running. `stop`, `status`, and `logs` do not track the new server.

In Astro 7.4.11, this flag also turns off automatic background mode. The server stays in the foreground.

Combining it with `--background` or `--force` makes Astro reject the command with an error.

## In this site's repo

Playwright in this repo runs `astro dev --ignore-lock` through its `webServer` setting. The flag keeps the server in the foreground until Playwright stops it with SIGTERM.

To run `astro dev` yourself in the foreground, add `ASTRO_DEV_BACKGROUND=0` before the command. Playwright does not need this variable.

```sh
env ASTRO_DEV_BACKGROUND=0 pnpm astro dev
```

Astro still records the server as background in `.astro/dev.json`, so `status` labels it `background`. `logs` fails with `No log file found.`, or prints an older log if an earlier background server left `.astro/dev.log`.
