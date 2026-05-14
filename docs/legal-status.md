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

The `us-legal-doc-reviewer` flagged four Critical items. The drafts
address each on the page, but a licensed Virginia attorney should sign
off on the wording before a paying subscriber is onboarded.

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

## Maintenance rhythm

- After any material site change → re-run the `us-legal-doc-reviewer`
  subagent and triage findings.
- Annually (and before any major launch) → counsel review of all four
  pages together.
- On every Stripe risk-review request → cross-check that the submitted
  business description still matches Terms §1 and the homepage services
  section.
