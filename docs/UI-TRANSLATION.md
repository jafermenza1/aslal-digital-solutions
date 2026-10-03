# Aslal Growth OS — App UI Translation Guide

## Purpose

The application UI uses a code-based dictionary so wording can be edited centrally without rewriting components.

- Website copy: `lib/i18n.ts`
- App/dashboard UI copy: `lib/app-i18n.ts`

Components should use semantic dictionary keys for shared shell labels rather than hard-coding repeated navigation terminology.

## Current languages

| Locale | Language | Website dictionary | App UI dictionary | Public selector | App inheritance |
|---|---|---:|---:|---:|---:|
| `en` | English | Yes | Yes | Yes | Yes |
| `am` | Amharic | Yes | Yes | Yes | Yes |
| `om` | Afaan Oromoo | Yes | Yes | Yes | Yes |

## Dictionary terminology table

| Key | English | Amharic | Afaan Oromoo | Usage |
|---|---|---|---|---|
| `nav.overview` | Overview | አጠቃላይ | Cuunfaa | Main dashboard |
| `nav.leads` | Leads & pipeline | Leads & የሽያጭ መስመር | Leads & pipeline | Sales workspace |
| `nav.customers` | Customers | ደንበኞች | Maamiltoota | Customer workspace |
| `nav.conversations` | Conversations | ውይይቶች | Haasaawwan | Customer communication |
| `nav.emailTemplates` | Email templates | የኢሜይል አብነቶች | Qajojjii email | Nested visually under Conversations |
| `nav.insights` | Insights | ግንዛቤዎች | Hubannoo | Demand/business intelligence |
| `nav.journey` | Visitor journey | የጎብኚ ጉዞ | Imala daawwataa | Visitor evidence |
| `nav.operations` | Operations | ኦፕሬሽን | Hojiiwwan | Production/sales execution |
| `nav.partners` | Partners & commissions | አጋሮች & ኮሚሽን | Hiriyyoota & komishinii | Partner workspace |
| `nav.products` | Product catalog | የምርት ካታሎግ | Kaatalogii oomishaa | Internal catalog |
| `nav.users` | Users & access | ተጠቃሚዎች & መዳረሻ | Fayyadamtoota & hayyama | Access management |
| `nav.publicCatalog` | Public products | የህዝብ ምርቶች | Oomishaalee uummataa | Public `/products` |
| `dashboard.overdue` | Overdue actions | ያለፈ እርምጃ | Tarkaanfii yeroo darbe | Follow-up warning |
| `dashboard.missingExecution` | Execution gaps | የአፈጻጸም ክፍተቶች | Hanqina raawwii | Missing owner/action/date |
| `dashboard.growthSignals` | High-intent signals | ከፍተኛ ፍላጎት ምልክቶች | Mallattoolee fedhii olaanaa | Demand signals |

## Editing an existing term

1. Edit the matching key/value in `lib/app-i18n.ts`.
2. Edit all existing locales for that key.
3. Keep placeholders unchanged.
4. For website copy, edit the matching key in `lib/i18n.ts`.
5. Run `npm run check`.
6. Check desktop and mobile navigation and confirm the term still fits its control.

## Adding another language

1. Add a new locale object to `lib/i18n.ts`.
2. `Locale` and `supportedLocales` are derived from that dictionary automatically.
3. Add the same locale key to `lib/app-i18n.ts`; TypeScript requires coverage.
4. Add the language to this guide's language table.
5. Add important shared terms to the terminology table.
6. The public and dashboard language controls will cycle through the supported locale list automatically.
7. Verify direction, font, wrapping, date/number formatting and mobile layout.

## Rules

- Use stable semantic keys.
- Keep terminology consistent across related screens.
- Do not put secrets or provider credentials in dictionaries.
- Keep placeholders exactly unchanged.
- Do not encode styling in translation values.
- Preserve technical product/provider names where translation would reduce clarity.
- A dictionary change is wording work; it must not silently change business logic.

## Acceptance scope

This foundation centralizes the public/app locale model and translates the shared dashboard shell and major dashboard labels. It does **not** claim that every legacy dashboard paragraph is translated. Those pages can be migrated incrementally without changing business behavior.


## Public Commerce terminology (PCCE-1)

The public commerce vocabulary is centralized in the `commerce` dictionary under each locale in `lib/i18n.ts`. The contract is documented in `docs/reconciliation/PCCE-1-EXPERIENCE-CONTRACT.md`.

Use these semantic keys for customer-facing commerce CTAs and intent paths rather than introducing screen-specific wording:

- `commerce.intents.growth`
- `commerce.intents.sell`
- `commerce.intents.automate`
- `commerce.intents.system`
- `commerce.tellUs`
- `commerce.findSolution`
- `commerce.requestProduct`
- `commerce.requestService`
- `commerce.customNeed`
- `commerce.talkSpecialist`
- `commerce.order`
- `commerce.browseProducts`
- `commerce.exploreServices`
- `commerce.talkTelegram`

Do not expose internal terms such as CommercialRequest or CommercialMatch as the primary public label.
