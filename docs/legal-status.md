# Legal-pages status — pre-counsel draft tracker

The legal pages (`/terms/`, `/privacy/`, `/refunds/`, `/contact/`) were
drafted from a structured gap-analysis (the `us-legal-doc-reviewer`
subagent) on 2026-05-14. They are **draft text suitable for Stripe sign-up
review**, but they are **not lawyer-reviewed**, and several items
deliberately commit to behavior that has to be implemented on the product
side before the policy is accurate at first paying subscriber.

This file is the internal tracker for what's done, what depends on a
counsel review, and what depends on product/UX work. It is not
customer-facing.

## Configuration baked into the current drafts

- **Legal entity.** Jared Howard (sole proprietor)
- **State of formation / residence.** Commonwealth of Virginia
- **Governing law.** Virginia
- **Venue.** Virginia state and federal courts
- **Dispute resolution.** Informal-first (30-day good-faith window), then
  Virginia courts. **No arbitration, no class-action waiver.**
- **Indemnification.** One-way (user → merchant), with merchant's right
  to assume defence on its own behalf.
- **Liability cap.** Greater of 12-months-fees-paid or US $100.
- **Subscription auto-renewal.** Yes; ROSCA-shaped disclosure baked into
  Terms §4; renewal-reminder commitment (15–45 days for annual plans);
  same-medium cancellation commitment.
- **Privacy framework.** CCPA-shaped baseline with explicit VCDPA appeal
  process and Virginia AG referral.
- **Analytics / tracking.** Site is currently first-party-only; Privacy
  §8 commits to updating the policy *before* any third-party analytics
  or ad tech is added.

If any of these assumptions changes, the relevant section needs to be
updated.

## Stripe sign-up readiness

- [x] Terms of Service exists at `/terms/`, linked from footer.
- [x] Privacy Policy exists at `/privacy/`, linked from footer.
- [x] Refund and Cancellation Policy exists at `/refunds/`, linked from
  footer.
- [x] Contact email is published and routes correctly.
- [x] Service description on the homepage matches Terms §1.
- [x] Currency stated as US dollars; payment method named (Stripe).
- [x] Auto-renewal disclosure language in place (Terms §4); the
  operational checkout-time disclosure still has to be implemented on
  the product side — see "Required product/UX work" below.

These items should clear an automated Stripe application review and a
first-pass manual review. Anything that depends on the product itself
(subscription checkout flow, in-product cancellation) is gated by the
work below, not by these pages.

## Required product/UX work before first paying subscriber

The Terms and Refunds pages commit to specific behaviors that the
product has to actually deliver. Don't bill the first subscriber until
these are real:

- [ ] **Pre-charge auto-renewal disclosure at checkout.** The actual
  sign-up screen has to clearly and conspicuously show: that the
  subscription auto-renews, the cadence, the renewal amount, the date of
  the first renewal charge, and how to cancel. The customer has to
  affirmatively accept (checkbox or signed click) and the acceptance has
  to be recorded.
- [ ] **In-product cancellation.** A single-step cancel control in
  account settings. Until this exists, the email path described in Terms
  §4.4 and Refunds §1 is the operational mechanism.
- [ ] **Renewal-reminder email for annual plans.** Automated, fires
  15–45 days before each renewal date, includes the renewal amount,
  renewal date, and a direct link to cancel.
- [ ] **Failed-payment dunning.** Up to 14 days of retry, customer
  notification, then suspension. (Stripe's smart retries cover most of
  this if turned on.)
- [ ] **Sub-processor list update.** Once the application-hosting
  platform, transactional-email provider, error-tracker, and any
  analytics tool are picked, update Privacy §4 to name them
  **before** any of them touches customer personal information.

## Open items for counsel review before launch

A licensed Virginia attorney should sign off on the wording below before
a paying subscriber is onboarded. Sections in the public legal pages
that contain tentative draft text are marked with an HTML comment
("DRAFT (round 2)") visible in the source but not rendered to readers.

**Round-1 items (still open, addressed in the page text):**

- [ ] **ROSCA + state-ARL alignment.** Counsel to confirm Terms §4 plus
  the planned checkout-disclosure UX satisfies both ROSCA (15 U.S.C. §8403)
  and the strictest state ARL we'll meet in practice (probably California,
  Bus. & Prof. Code §17600 et seq., even though Virginia is the governing
  law — California consumers can still buy).
- [ ] **Dispute resolution architecture.** Counsel to confirm the
  courts-based-with-informal-first structure (Terms §13) is appropriate
  for our risk profile; reconsider arbitration only if counsel
  recommends it.
- [ ] **CCPA / VCDPA disclosures.** Counsel to confirm Privacy §§ 2–7
  satisfy CCPA/CPRA, VCDPA, CO CPA, CT CTDPA, UT UCPA, and TX TDPSA, or
  flag any state where additional disclosure is needed.
- [ ] **Click-to-cancel mechanism.** Counsel to confirm the in-product
  cancel UX, when built, satisfies the FTC click-to-cancel rule's
  "same medium" principle and California's single-step cancellation
  requirement.

**Round-2 items (new tentative drafts, added 2026-05-14):**

- [ ] **Liability cap carve-outs (Terms §10).** Counsel to confirm the
  enumerated carve-outs (gross negligence, wilful misconduct, fraud,
  personal injury, our §11.2 indemnity, non-waivable claims) are
  complete for Virginia and for B2C exposure in California, New Jersey,
  and Massachusetts in particular. The cap currently relies on these
  carve-outs to survive an unconscionability attack.
- [ ] **Mutual indemnification (Terms §11.1 + §11.2).** Counsel to
  confirm: (a) the narrow IP-infringement indemnity in §11.2 is the
  right scope, (b) the enumerated exclusions in §11.2 (Customer Content,
  modifications, combinations, post-notice use) are complete, (c)
  whether §11.1 should be additionally restricted to organisational
  customers to avoid unconscionability attack in B2C contexts, and (d)
  the §11.3 procedural mechanics are appropriate.
- [ ] **AI/ML provisions (Terms §6.2.1 and §6.2.2).** Counsel to
  confirm the split between training / third-party inference /
  internal operational tooling, and to verify that §6.2.2 accurately
  describes the merchant's actual AI workflow without overcommitting.
- [ ] **Custom-development assignment-on-payment (Terms §6.3).** Counsel
  to confirm the assignment language is enforceable in Virginia, the
  Background-IP carve-out is appropriately scoped, and the third-party
  / open-source materials disclaimer is sufficient. Also confirm whether
  an explicit SOW IP clause should be a precondition for engagement.
- [ ] **Wind-down floor (Terms §8.3).** Counsel to confirm the 30-day
  default (10-day for non-payment) Wind-Down Period aligns with VCDPA /
  CCPA right-to-portability provisions.

## Other items to revisit periodically

These are not blockers but are worth a periodic review (suggest
quarterly while pre-launch, then annually):

- [ ] **Sub-processor list.** Add named vendors as they're selected;
  remove or replace as the stack changes (Privacy §4).
- [ ] **Effective date / last-reviewed date.** Update "Last reviewed" on
  each page each time you skim the page, even if no edit is made.
  Update "Effective" only on material changes.
- [ ] **International / non-US user posture.** Currently US-only
  (Privacy §1, Terms §12). If marketing ever targets EU/UK customers,
  the entire privacy regime has to be re-evaluated for GDPR.
- [ ] **Sensitive personal information.** Privacy §2 currently states we
  collect none. If that changes — for example, if a product collects
  precise geolocation, government IDs, or account credentials for
  third-party systems — Section 2 has to be updated and (in some states)
  opt-in consent has to be obtained.
- [ ] **State expansion.** If we register the sole prop or form an LLC
  in a different state, Terms §12 and Privacy §1 need to be updated.

## Launch gates (hard blockers for first paying subscriber)

The public legal pages commit to specific behaviour that the product
has to actually deliver. Do **not** start billing a subscriber until
every item below is either built or the relevant page is edited to
remove the future-tense commitment:

- [ ] **In-product cancellation control.** Terms §4.4 and Refunds §1
  both promise this in future tense. Build it, or edit both sections
  before the first paid signup.
- [ ] **Pre-charge auto-renewal disclosure UX.** Terms §4.2 promises a
  "clear and conspicuous" disclosure at checkout with affirmative
  consent. Build the checkbox-with-disclosure step, or edit §4.2 to
  match what the actual UX does.
- [ ] **Automated annual-renewal reminder email.** Terms §4.3 commits
  to a 7–45 day reminder window. Stand up the automation (or use a
  Stripe customer-portal feature that does it) before the first
  annual subscription is sold.
- [ ] **Plan-specific refund documentation.** Refunds §2 defers
  annual-pro-rata to "the documentation for the specific plan you
  purchased". Write that documentation for each plan, or edit §2 to
  remove the deferral, before annual plans go on sale.

## Post-domain-purchase items

When the custom domain is registered and pointed at the site (see
`docs/domain-setup.md`), do these as part of the cutover:

- [ ] **Move the published legal-notice address to a domain-controlled
  forwarder** (e.g. `legal@<domain>` or `contact@<domain>`, forwarding
  to the Gmail inbox). Reduces the risk that a Gmail suspension nukes
  every customer-facing legal-notice channel at once. Update Terms §16,
  Privacy §11, Refunds §6, and Contact page accordingly.
- [ ] **Re-publish with the custom domain in `base_url`** (per
  `docs/domain-setup.md`) and then re-run the `us-legal-doc-reviewer`
  to catch any references to the old GitHub-Pages URL.

## Maintenance rhythm

- After any material site change → re-run the `us-legal-doc-reviewer`
  subagent and triage findings.
- Annually (and before any major launch) → counsel review of all four
  pages together.
- On every Stripe risk-review request → cross-check that the submitted
  business description still matches Terms §1 and the homepage services
  section.
- **Quarterly** while pre-launch (annually post-launch) → verify the
  sub-processor list in Privacy §4 is still accurate, that no
  third-party analytics / tracking has crept in, and that the
  acknowledgement-only mention of Stripe / GitHub / Google still
  matches reality. (Hard URLs were removed from §4 in round 2 to
  avoid link-rot.)

## Forward-looking notes

These don't need action today but should trigger an audit if they ever
change:

- **Trade name / DBA.** The business currently operates under the legal
  name "Jared Howard". The homepage links to a GitHub profile under the
  handle `Absence0760`. If we ever adopt a trade name (whether
  `Absence0760` or anything else) in customer-facing copy, Virginia DBA
  registration applies and Terms §16, Privacy §11, Refunds §6, the
  homepage, and the footer all need to be updated to use the trade
  name consistently.
- **Entity formation.** Currently a sole proprietorship. If we form a
  Virginia LLC or move to another state, Terms §12, Privacy §1, and the
  legal-notice address all change.
- **Future contractors.** Terms §10 and §11 both now extend "us" to
  cover employees, contractors, agents, licensors, and successors. If
  we ever sub-contract custom-development work, ensure the contractor
  is bound by an NDA / IP-assignment agreement so the §11.2 indemnity
  obligation doesn't outrun what the contractor is liable to us for.
