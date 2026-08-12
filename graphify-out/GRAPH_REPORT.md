# Graph Report - .  (2026-07-03)

## Corpus Check
- Corpus is ~6,948 words - fits in a single context window. You may not need a graph.

## Summary
- 67 nodes · 77 edges · 5 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_index.js cluster|index.js cluster]]
- [[_COMMUNITY_package.json cluster|package.json cluster]]
- [[_COMMUNITY_dependencies cluster|dependencies cluster]]
- [[_COMMUNITY_getRandomItem() cluster|getRandomItem() cluster]]
- [[_COMMUNITY_sendWakatimeHeartbeat() cluster|sendWakatimeHeartbeat() cluster]]

## God Nodes (most connected - your core abstractions)
1. `getRandomItem()` - 6 edges
2. `sendWakatimeHeartbeat()` - 5 edges
3. `lightBoost()` - 4 edges
4. `scripts` - 4 edges
5. `saveQueueToDisk()` - 3 edges
6. `getAxios()` - 3 edges
7. `flushTelemetryQueue()` - 3 edges
8. `boostProfile()` - 3 edges
9. `runContributionBurst()` - 3 edges
10. `simpleGit` - 2 edges

## Surprising Connections (you probably didn't know these)
- `sendWakatimeHeartbeat()` --calls--> `getRandomItem()`  [EXTRACTED]
  index.js → index.js  _Bridges community 4 → community 3_

## Import Cycles
- None detected.

## Communities (5 total, 0 thin omitted)

### Community 0 - "index.js cluster"
Cohesion: 0.06
Nodes (28): app, axios, cron, DailyRotateFile, DEPENDENCY_MAP, DUMMY_BRANCHES, DUMMY_COMMIT_MESSAGES, DUMMY_EDITORS (+20 more)

### Community 1 - "package.json cluster"
Cohesion: 0.15
Nodes (12): author, description, keywords, license, main, name, scripts, dev (+4 more)

### Community 2 - "dependencies cluster"
Cohesion: 0.15
Nodes (13): dependencies, axios, dotenv, express, https-proxy-agent, node-cron, puppeteer-core, puppeteer-extra (+5 more)

### Community 3 - "getRandomItem() cluster"
Cohesion: 0.47
Nodes (6): boostProfile(), getAxios(), getRandomItem(), lightBoost(), runContributionBurst(), simpleGit

### Community 4 - "sendWakatimeHeartbeat() cluster"
Cohesion: 0.67
Nodes (4): flushTelemetryQueue(), saveQueueToDisk(), sendWakatimeHeartbeat(), wakaLoop()

## Knowledge Gaps
- **51 isolated node(s):** `axios`, `winston`, `DailyRotateFile`, `express`, `http` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies cluster` to `package.json cluster`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `getRandomItem()` connect `getRandomItem() cluster` to `index.js cluster`, `sendWakatimeHeartbeat() cluster`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `axios`, `winston`, `DailyRotateFile` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.js cluster` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._