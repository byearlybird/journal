# Journal by Early Bird

A simple, always‑ready, always‑private journal that lives in your browser and gets out of your way.

No feeds. No streaks. No “build your second brain.” Just a quiet place to write what’s on your mind and feel a little more relieved at the end of the day.

## Who it’s for

- Regular people who want a simple place to jot things down  
- Folks who don’t want to think about “systems” or “workflows”  
- Anyone who cares that their journal stays *theirs* — and private

## How it fits into your day

- **Morning** – Take a minute to set intentions, dump worries, or sketch the day ahead.  
- **During the day** – Capture thoughts as they pop up: ideas, frustrations, little wins.  
- **Evening** – Reflect on what happened, how you felt, and what you want to remember for tomorrow.

You don’t organize anything. Entries simply flow through time. Yesterday stays yesterday; today is what you’re looking at now.

## What makes it different

- **Always ready**  
  Opens quickly in your browser. No setup, no “onboarding flow,” no deciding where things go. Just type.

- **Always private**  
  Your entries are stored locally in your browser. There’s no central server that can read them, because we never have them.

- **Simple method, not a maze**  
  The app gives you a straightforward pattern: write today, come back later and reflect, then move on. No tags, boards, or complex views to maintain.

- **Flows through time**  
  Your journal is one continuous stream of days and entries. You see past days, today, and your thoughts as they naturally stack up.

The goal isn’t to build the most powerful journaling tool. It’s to build one that you’ll actually use.

## Privacy, in plain language

Here’s the line in the sand: We will never be able to read your journal entries.
Your data is stored locally in your browser using an on‑device database. It’s your journal. Full stop.

## Tech, briefly (for the curious)

Journal is built as a small web app using:

- **React + TypeScript + Vite** for the interface  
- **Starling DB** for storage — a local‑first, open‑source database library built in‑house at Early Bird, which keeps your data on your device

Everything runs in the browser and stores data in your local IndexedDB.

To run it locally:

```bash
npm install   # or bun install
npm run dev
```

## Try it

Journal is an early‑stage product, actively being shaped by real use. It’s stable enough for everyday journaling, and simple enough that you won’t get lost in it.

If you try it, don’t overthink it. Write one short entry today, close the tab, and see how it feels to come back tomorrow knowing no one — including us — can read what you wrote.
