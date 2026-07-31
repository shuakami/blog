# Project Notes

- `npm run lint` currently calls `next lint`, which is not a valid Next 16 command path in this repo and gets interpreted as a directory. Prefer `npm run build` for validation unless the lint script is updated.
- This repo deploys through Vercel from `master`; keep `vercel.json` change detection scoped to the whole repo (`git diff --quiet HEAD^ HEAD -- .`) so nested `src/` changes trigger deployment.
- Obsidian posts are stored in Redis after processing. Author avatar fixes must work at render time too, because old Redis records can keep stale `authorAvatar` values.
