---
name: Expo preview diagnostics
description: Distinguish a nonfatal React Native DevTools install warning from an Expo app startup failure.
---

If Expo logs an error installing React Native DevTools because a system library such as `libglib-2.0.so.0` is unavailable, Metro can still start and the Expo Go preview can remain usable. Confirm the workflow reaches its Expo Go / web URL and inspect the running app before treating that diagnostic as a blocker.

**Why:** The preview environment started successfully despite this missing-library message, so restarting or changing app code to fix the DevTools installer would not address a user-visible failure.

**How to apply:** When this message appears, check whether Metro is serving and capture the app preview. Only investigate further if the app itself fails to bundle or render.