This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


```
playerwavehub
├─ app
│  ├─ (admin)
│  │  ├─ biographies
│  │  │  └─ page.tsx
│  │  ├─ clubs
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     └─ page.tsx
│  │  ├─ countries
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     └─ page.tsx
│  │  ├─ head-coach
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ national-teams
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ players
│  │     ├─ new
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [id]
│  │        ├─ attriubtes
│  │        │  └─ page.tsx
│  │        ├─ edit
│  │        │  └─ page.tsx
│  │        ├─ hidden-attributes
│  │        │  └─ page.tsx
│  │        ├─ page.tsx
│  │        ├─ sources
│  │        │  └─ page.tsx
│  │        └─ stints
│  │           └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ login
│     ├─ action.ts
│     ├─ LoginForm.tsx
│     └─ page.tsx
├─ components
│  ├─ ArchiveIcon.tsx
│  ├─ biographies
│  │  ├─ BiographiesForm.tsx
│  │  └─ DeletePersonButton.tsx
│  ├─ clubs
│  │  └─ ClubForm.tsx
│  ├─ coaches
│  │  ├─ CoachesForm.tsx
│  │  └─ CoachesTable.tsx
│  ├─ countries
│  │  └─ CountryForm.tsx
│  ├─ national-teams
│  │  └─ NationalTeamForm.tsx
│  ├─ players
│  │  ├─ AttributesForm.tsx
│  │  └─ PlayerForm.tsx
│  ├─ Sidebar.tsx
│  ├─ SidebarNav.tsx
│  └─ ui
│     ├─ DeleteRecordButton.tsx
│     ├─ DetailTabs.tsx
│     ├─ kit.tsx
│     └─ RecordTable.tsx
├─ eslint.config.mjs
├─ lib
│  ├─ actions
│  │  ├─ biographies.ts
│  │  ├─ clubs.ts
│  │  ├─ coach.ts
│  │  ├─ countries.ts
│  │  ├─ national-teams.ts
│  │  ├─ player-attributes.ts
│  │  └─ players.ts
│  ├─ auth.ts
│  ├─ biographies.ts
│  ├─ db
│  │  ├─ clubs.ts
│  │  ├─ coach.ts
│  │  ├─ countries.ts
│  │  ├─ national-teams.ts
│  │  ├─ player-attributes.ts
│  │  ├─ players.ts
│  │  └─ util.ts
│  ├─ form-state.ts
│  ├─ slug.ts
│  ├─ supabase
│  │  ├─ admin.ts
│  │  └─ server.ts
│  └─ validation
│     ├─ club.ts
│     ├─ coach.ts
│     ├─ common.ts
│     ├─ country.ts
│     ├─ national-team.ts
│     ├─ person.ts
│     ├─ player-attributes.ts
│     └─ player.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ linked-project.json
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  ├─ storage-migration
│  │  └─ storage-version
│  ├─ config.toml
│  └─ migrations
│     ├─ 20261017165713_init.sql
│     ├─ 20261019192749_rename_people_to_biographies.sql
│     ├─ 20261020180311_finish_biographies_rename.sql
│     └─ 20261023161202_restrict_biography_delete.sql
└─ tsconfig.json

```