# Custom domain setup (Route 53 + GitHub Pages)

How this site's custom domain is wired up — captured both as a history of
what was done for `jaredhoward.com` and as a recipe if the domain ever needs
to be repointed or replaced. The repo's current state is:

- `static/CNAME` contains `jaredhoward.com`
- `config.toml` has `base_url = "https://jaredhoward.com"`
- DNS lives in Route 53 with the records described below

If you're following these steps to set up a *different* domain, replace
every occurrence of `yourdomain.com` below with the real one.

## 1. Add a `CNAME` file to the site root

GitHub Pages reads `/CNAME` from the deployed site to lock in the custom
domain. Zola copies `static/*` to the deploy root, so:

```bash
echo "yourdomain.com" > static/CNAME
```

Use the apex domain (`yourdomain.com`), not `www.yourdomain.com`, unless you
specifically want to serve from the `www` subdomain. Pages will issue a
redirect from the other variant either way.

## 2. Update `base_url` in `config.toml`

Replace the existing `base_url` with `https://yourdomain.com` (no trailing
slash). This is what Zola uses for canonical URLs, RSS, and `get_url(...)`
calls inside templates.

## 3. DNS records in Route 53

In the hosted zone for the domain, create:

**Apex (`yourdomain.com`)** — four A records pointing at GitHub Pages' IPs:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**`www` subdomain** — a CNAME record pointing at the GitHub Pages host:

```
absence0760.github.io
```

(That's the username — Pages uses `<user>.github.io`, not the repo name, as
the CNAME target.)

If you want IPv6 too, add AAAA records at the apex:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

## 4. Configure the custom domain in GitHub

Repo → Settings → Pages:

1. Set **Custom domain** to `yourdomain.com`. Save.
2. Wait for the DNS check to pass (can take a few minutes after Route 53 propagates).
3. Tick **Enforce HTTPS** once the cert provisions (TLS via Let's Encrypt,
   usually 5–15 minutes after the DNS check passes).

The custom-domain value GitHub stores is just persisted from the `CNAME` file
in the deployed site — committing the file in step 1 is what makes this
sticky across future deploys.

## 5. Sanity check

```bash
curl -I https://yourdomain.com         # expect 200 + GitHub Pages headers
curl -I https://www.yourdomain.com     # expect 301 to apex (or vice versa)
```

If you get certificate errors right after enabling HTTPS, wait — provisioning
is async and the error usually clears within 15 minutes.

## 6. Things to double-check before pointing Stripe at the new URL

- The site loads at `https://yourdomain.com` without a cert warning.
- Footer links to `/terms`, `/privacy`, `/refunds`, `/contact` all resolve.
- The "What I'm building" section on the homepage matches the description
  you submitted to Stripe — same two streams, same billing language.
- `mailto:` link on the Contact page opens the correct address.
