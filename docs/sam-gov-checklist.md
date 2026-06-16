# SAM.gov registration checklist

The [Capability Statement](../content/capabilities.md) ships with placeholders
marked `[ TO BE ASSIGNED ]` for the federal identifiers that only exist once the
business is registered in **SAM.gov**. This doc is the to-do list for obtaining
them and the steps to replace the placeholders afterward.

> None of this is legal or contracting advice. Verify current requirements at
> [SAM.gov](https://sam.gov) — the process changes.

## What to obtain (in order)

1. **Confirm the legal entity & address.** Sole proprietor, Commonwealth of
   Virginia. Have the legal business name and physical address ready — they must
   match exactly across every system.
2. **Get a UEI (Unique Entity Identifier).** A 12-character ID assigned in
   SAM.gov; it replaced the DUNS number in April 2022. Created as part of entity
   registration — no separate DUNS step.
3. **CAGE code.** Five-character Commercial and Government Entity code. For
   domestic entities it is **assigned automatically** during SAM.gov
   registration — you do not request it separately.
4. **Complete the full SAM.gov entity registration.** Includes Reps & Certs.
   Required before you can be awarded a federal contract. Renew annually.
5. **Confirm NAICS code selections.** Already chosen on the capability statement:
   - **541511** — Custom Computer Programming Services (primary; this is the
     web-development code).
   - **541512** — Computer Systems Design Services.
   - **513210** — Software Publishers.
   - **541519** — Other Computer Related Services (optional).
   Add/adjust in SAM.gov as the offering evolves.
6. **Self-certify small business size.** The 541511 SBA size standard is
   ~$34M average annual receipts, so a sole proprietorship qualifies easily.
7. **Evaluate set-aside eligibility.** Decide whether any socioeconomic
   programs apply (8(a), HUBZone, SDVOSB/VOSB, WOSB/EDWOSB). **Do not claim any
   you do not qualify for** — the capability statement currently states only
   "Small Business; other set-asides under evaluation."

## After registration: update the capability statement

Edit `content/capabilities.md`:

- Replace the **UEI** `[ TO BE ASSIGNED ]` with the assigned 12-char UEI.
- Replace the **CAGE code** `[ TO BE ASSIGNED ]` with the assigned code.
- Remove the `> Status: draft — registration in progress.` callout once active.
- Update the **Socioeconomic status** line if any set-aside certification is
  granted.
- Update the parallel "registering on SAM.gov" wording on the homepage
  (`templates/index.html`) and `content/services.md`.

Then run `pnpm build` and `pnpm check`, and (if material) run the legal pages
past `docs/legal-status.md` — though identifiers are factual data, not legal
commitments, so they normally don't trigger the tracker.

## Optional follow-ups

- Produce a one-page **PDF** capability statement once the data is real
  (federal buyers often ask for a PDF attachment).
- Watch for relevant solicitations on SAM.gov under the NAICS codes above.
