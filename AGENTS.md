# Project Notes

- `npm run lint` currently calls `next lint`, which is not a valid Next 16 command path in this repo and gets interpreted as a directory. Prefer `npm run build` for validation unless the lint script is updated.
