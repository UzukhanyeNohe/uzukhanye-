# Curious Incident — Grade 10 IEB Study Pack

Static study pack (`index.html`) + one Vercel serverless function (`api/mark.mjs`)
that marks "The Real Test" (section 19) using the Anthropic API. The API key
never touches the browser — it lives in a Vercel environment variable.

The pack lives at the repo root, so Vercel deploys it with zero config: `index.html`
is served statically and `api/mark.mjs` becomes the `/api/mark` serverless function.

## Deploy — option A: browser only (no CLI)

1. Go to <https://vercel.com/new> and import this repository.
2. Project name: `curious-study-pack`. Leave every build setting on its default
   (Framework Preset: Other, Root Directory: `./`).
3. Before clicking Deploy, open **Environment Variables** and add
   `ANTHROPIC_API_KEY` = your key from <https://console.anthropic.com>, scoped to
   **Production**.
4. Deploy.

## Deploy — option B: CLI (2 minutes)

```bash
npm i -g vercel
vercel login
vercel --yes                                   # link/create the project
vercel env add ANTHROPIC_API_KEY production    # paste your key when prompted
vercel --prod
```

Send your brother the `*.vercel.app` URL — works on his phone, nothing to install.

## Verify after deploying

```bash
curl -s https://<your-url>.vercel.app | grep -c "Curious Incident"   # expect a non-zero count

curl -s -X POST https://<your-url>.vercel.app/api/mark \
  -H 'Content-Type: application/json' \
  -d '{"content":"QUESTION 1.1 (2 marks): Who killed Wellington? LEARNER'\''S ANSWER: Ed Boone killed him."}'
```

The POST should return `200` with JSON containing `"questions"`. A `500` saying
`ANTHROPIC_API_KEY is not set` means the env var did not reach production — re-add
it and run `vercel --prod` again.

## Redeploy after any future edit

```bash
vercel --prod
```

## Notes

- Everything except section 19 works fully offline / statically.
- Marking cost: each submission is one Sonnet call (~R0.30–R0.60). Nothing is
  stored server-side; resubmitting after rewriting is encouraged.
- If the marking button says "Marking failed", check that the env var is set
  and redeploy (`vercel --prod`).
