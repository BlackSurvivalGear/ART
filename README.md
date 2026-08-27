# African Revolutionary Timeline (ART)

A data-driven, interactive archive tracing African and Black resistance, revolution, liberation and sovereignty from the 1500s to the present.

## Current foundation

- Dark museum/archive visual system using the ART logo.
- Responsive landing page.
- Searchable, filterable historical timeline.
- Era and movement taxonomy.
- People profiles with event connections.
- Regional Africa explorer.
- Modern-era AES feature.
- Source/editorial principles section.
- GitHub Pages deployment workflow.

## Phase 2 knowledge graph

- `data.js` retains the initial timeline and presentation-oriented seed content.
- `knowledge.js` introduces stable IDs for people, events and movements plus relationships between people.
- `sources.js` introduces source metadata, editorial statuses and a policy for separating evidence from interpretation.
- The UI consumes the graph for richer person profiles while retaining the legacy dataset as a compatibility fallback.

Core concepts: people, events, movements, organisations, countries, places, ideas, eras and sources.

## Editorial principle

The current dataset is a **seed dataset**, not a claim of completeness. Historical entries should be progressively verified against primary and high-quality secondary sources, with factual claims, interpretation and contested accounts clearly distinguished.

## Development direction

The next stages should add dedicated routes/views for people, events and movements; expand the historical dataset; attach source records to individual claims; add a true geographic map; and evolve the static seed files into a source-backed historical knowledge graph suitable for deeper research and exploration.
