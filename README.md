### Folder structure

NOTE: Some files was removed for reduce tree view.

Folder structure has some description for explain relations between folders

<pre>
├── Dockerfile
├── README.md
├── config
│   ├── app.json
│   ├── flyway.dev.conf
│   └── flyway.prod.conf
├── docker-compose.worker.yml
├── docker-compose.yml
<span style="color:pink">├──migrations</span> - <b>Databse migrations</b>
│   ├── V1__initial.sql
│   └── V2__missed_epochs.sql
├── package.json
├── pnpm-lock.yaml
├── process.docker.json
├── process.worker.docker.json
├── src
|   <span style="color:red">├── app.ts</span> - <b>Main file</b>
│   ├── assets
│   <span style="color:red">├── constants.ts</span><i> - May will separated to logic foldet in future</i>
|   |
│   ├── custom.d.ts
|   | 
<i>Logic contains main logic for REST API method and Workers. Can used everywhere. Can contain   cohesion logic between shared and specific services</i>
|   |
|   ├── <span style="color:yellow">logic</span>
│   │   └── ethereum
│   │       ├── index.ts
│   │       ├── scanner
│   │       │   ├── filter-validators.ts
│   │       │   ├── get-rewards-per-epoh-all-validators.ts
│   │       │   ├── get-rewards-per-epoh-selected-validators.ts
│   │       │   └── index.ts
│   │       ├── tables
│   │       │   ├── index.ts
│   │       │   ├── rewards-details.ts
│   │       │   ├── rewards-summary.ts
│   │       │   └── withdrawals.ts
│   │       └── utils
│   │           └── index.ts
|   | 
<i>Api model as bridge iterface  between  codebase and DB, can impmerent own crud logic</i>
|   |
│   ├── <span style="color:yellow">models</span>
│   │   ├── attestation-rewards.ts
│   │   ├── proposer-rewards.ts
│   │   └── sync-committee-rewards.ts
|
<i>Static Server folder</i>
│   ├── <span style="color:yellow">public</span>
│   │   └── docs
│   │       └── ethereum
|   |
<i>Folder with services, that's should use in other components</i>
|   |
│   ├── <span style="color:yellow">services</span>
|   |
<i>Private - contains specifics services, it primitives functions, that has base logic, <b>private services</b> can have hight cohesion and can use <b>shared services</b> </i>
│   │   ├── <span style="color:green"> private</span>
│   │   │   └── ethrereum
│   │   │       ├── api - SWAGER BEACOUN NODE API 
│   │   │       ├── eth-cache.ts
│   │   │       ├── eth-client.ts
│   │   │       ├── eth-db.ts
│   │   │       ├── index.ts
|
<i>Shared - contains shared services, it can use everywhere,  should  contains only primitive logic</i>
│   │   └── <span style="color:green">shared</span>
│   │       ├── database
│   │       │   ├── clients.ts
│   │       │   ├── database.ts
│   │       │   └── index.ts
│   │       ├── env
│   │       │   ├── index.ts
│   │       │   ├── is-development.ts
│   │       ├── orm
│   │       │   └── index.ts
│   │       ├── redis
│   │       │   ├── client.ts
│   │       │   └── simple-cache.ts
│   │       └── worker
│   │           ├── constants.ts
│   │           ├── index.ts
│   │           ├── types.ts
│   │           └── worker.ts
|
<i>Types - contains special types, that can be used in many places </i>
|
│   ├── <span style="color:green">types</span>
│   │   ├── ethereum.ts
│   │   └── index.ts
|
<i>Utils - small helpers functions</i>
|
│   ├── <span style="color:green">utils</span>
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   └── logger.ts
|
<i>Workers - contains scripts for execution in separated shells, all of them should be running via pm2 </i>
|
│   └── <span style="color:green">workers</span> 
│       └── ethereum
│           ├── rewards-scanner
│           │   └── missed-epoch.ts
│           └── withdrawals.ts
└── tsconfig.json</pre>
