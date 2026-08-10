---
title: "Your third parties are part of your operating model"
description: "Security posture is increasingly determined by the systems, suppliers, and decisions outside the org chart."
date: 2026-07-16
category: "Resilience"
readingTime: "7 min read"
eyebrow: "Signal · Resilience"
---

Verizon’s 2025 Data Breach Investigations Report analyzed 12,195 confirmed breaches and found third-party involvement in 30% of them. Exploitation of vulnerabilities accounted for 20% of breaches as an initial access vector. These numbers are not merely a case for more security tooling. They are a case for a more honest definition of the enterprise.

If a supplier operates a critical process, handles a sensitive dataset, or controls an integration, it is already part of the service. The fact that the supplier sits outside the legal entity does not make its failure external to the customer experience.

## The contract is not the control

Many organizations have vendor-risk questionnaires, security clauses, and annual reviews. Those are useful, but they do not answer the operational questions that matter during a disruption:

- Who can make the decision to isolate the supplier?
- Which capabilities can continue in degraded mode?
- Where is the authoritative inventory of interfaces, identities, and data flows?
- How quickly can the business detect that a dependency has changed?
- Who owns the recovery sequence across organizational boundaries?

These questions belong in service design, architecture, incident management, procurement, and executive governance—not in a single risk register.

## Build the dependency graph into the operating rhythm

We recommend treating third-party dependencies as products to be observed. Assign an owner. Define a service promise. Map the critical path. Test the failure mode. Establish a decision cadence that reviews exceptions and concentration risk before an incident forces the organization to learn in public.

CISA’s [Zero Trust Maturity Model](https://www.cisa.gov/sites/default/files/2023-04/zero_trust_maturity_model_v2_508.pdf) is useful here because it shifts the conversation from perimeter trust to explicit policy, visibility, and continuous evaluation. The same principle should shape the management system around suppliers.

## The Global Enterprise view

We bring strategy, architecture, and change management into the supplier conversation. The objective is not to eliminate every dependency; it is to make the important ones visible enough to govern, resilient enough to operate, and replaceable enough to negotiate from a position of strength.

## Sources

- [Verizon, 2025 Data Breach Investigations Report](https://www.verizon.com/about/news/2025-data-breach-investigations-report)
- [CISA, Zero Trust Maturity Model 2.0](https://www.cisa.gov/sites/default/files/2023-04/zero_trust_maturity_model_v2_508.pdf)
