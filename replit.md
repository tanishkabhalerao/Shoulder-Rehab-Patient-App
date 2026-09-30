# AI Digital Twin Physiotherapy

An Expo mobile platform with separate patient and physiotherapist workspaces for rehabilitation plans, exercise sessions, progress, digital twins, and pose-analysis workflows.

## Run & Operate

- `pnpm --filter @workspace/shoulder-rehab-patient run dev` — run the Expo app
- `pnpm --filter @workspace/shoulder-rehab-patient run typecheck` — typecheck the mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run the shared API scaffold

The current physiotherapy workflow uses the existing Expo app's AsyncStorage context as a shared local demo store. The API and Drizzle packages remain scaffolds; no production database connection is claimed or required for the local demo.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 scaffold in `artifacts/api-server`
- DB: PostgreSQL + Drizzle ORM scaffold in `lib/db`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/shoulder-rehab-patient/app/(auth)` — role selection and login
- `artifacts/shoulder-rehab-patient/app/(tabs)` — patient dashboard, exercises, progress, AI analysis, Digital Twin, and profile
- `artifacts/shoulder-rehab-patient/app/(physio)` — physiotherapist dashboard, patients, plans, pose analysis, profiles, and patient drill-downs
- `artifacts/shoulder-rehab-patient/src/state.tsx` — shared persisted demo store and patient/physiotherapist role boundary
- `artifacts/shoulder-rehab-patient/src/pose.ts` — normalized pose-analysis adapter boundary for a future Python/OpenCV + MediaPipe service
- `artifacts/shoulder-rehab-patient/src/data.ts` — demo accounts, patients, exercises, sessions, landmarks, and demo analysis values

## Architecture decisions

- Patient and physiotherapist access are separate Expo Router groups and are selected before login.
- The shared state store is the demo source of truth, so assignments and completed sessions flow between profiles on one device.
- Camera access is preserved for patient sessions, but pose values are explicitly marked demo until a real inference service is connected.
- Exercise records carry analysis metadata (required landmarks, thresholds, precautions) so the library is extensible beyond shoulder-only movements.

## Product

Patients can view assigned exercises, start sessions, capture a camera snapshot, record repetitions, inspect progress, review their Digital Twin, and inspect the pose-analysis interface. Physiotherapists can manage sample patients, create/edit/delete exercises, assign exercises, view sessions and trends, open patient Digital Twins, and inspect normalized landmark data and joint angles.

## Demo accounts

- Patient: `patient@test.com` / `Patient123`
- Physiotherapist: `physio@test.com` / `Physio123`

## Gotchas

- Live MediaPipe/OpenCV inference is not connected in the Expo client; demo pose values are labeled and isolated in `src/pose.ts`.
- The local demo store is not multi-device persistence. Connect the existing API/database scaffolds before using real clinical data.
- The Expo workflow may log a React Native DevTools `libglib-2.0.so.0` warning while Metro still serves the app.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
