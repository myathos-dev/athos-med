# Roadmap

Goal: turn the Athos CRM base into a telehealth portal on Medplum where patients order peptides and other medications through sync or async visits. Mock data only.

## Data
- [ ] Run Medplum locally from `external/medplum`
- [ ] Load the mock product catalog (`mock-data/products.json`) into Medplum
- [ ] Fill in the catalog: prices, stack contents, products for the remaining categories
- [ ] Replace the local JSON record store (`server/`, `src/lib/datasource.js`) with Medplum

## Patient portal
- [ ] Browse products by category and stack
- [ ] Order through an async visit
- [ ] Order through a sync (live) visit
- [ ] See own orders and their status

## Clinician view
- [ ] Async visit queue
- [ ] Sync visit schedule
- [ ] Review and act on orders

## Convert the CRM base
- [ ] Rework Sales Hub → clinician home
- [ ] Rework Lead Queue → visit and order queue
- [ ] Rework Leads Dashboard → patients and orders table
- [ ] Remove sales-only content (DM and email templates, lead types)

## Open decisions
- [ ] How users sign in and how the patient or clinician role is set
- [ ] How sync visits run (video, chat, or both)
