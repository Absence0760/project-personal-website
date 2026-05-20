# Running locally

The repo ships a thin pnpm wrapper around the Zola CLI so the day-to-day
commands match the rest of the projects on this workstation. Either form
works — `pnpm <script>` and the underlying `zola <command>` are interchangeable.

```bash
# Start a local dev server with live reload (http://127.0.0.1:1111)
pnpm dev          # → zola serve

# Build the site into ./public
pnpm build        # → zola build

# Validate links + templates without building
pnpm check        # → zola check

# Preview with a fixed base-url (useful when sharing on the LAN)
pnpm preview      # → zola serve --base-url http://localhost
```

`pnpm test` is aliased to `pnpm build` — there is no test framework here,
and a green build is the only verification surface (Zola fails the build
on dead `get_url()` calls and template errors).

No `pnpm install` is needed before any of the above; the root
`package.json` declares no dependencies. The wrapper exists purely so
the command interface matches the operator's other repos.

Zola itself is installed via the official tarball (`~/.local/bin/zola`,
pinned to `0.19.2` in CI). See `~/CLAUDE.md` "Specific tool decisions"
for the install convention.
