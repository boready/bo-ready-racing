# Ready Racing clean rebuild

- The previously flagged `site-chrome.js` is **not included**.
- A newly written, readable `navigation.js` handles the year and mobile menu, without network requests.
- The unused `/admin/` dashboard was excluded from this static GitHub Pages build.
- Existing gallery, photo viewer, sponsor showcase and Facebook links are retained.
- This is a source-level cleanup, **not a malware-free certification**. Scan with Microsoft Defender before deploying.
- The remaining JavaScript was inherited from the previous site package and should be reviewed before production use.
- GitHub Pages does not implement `/api/*` routes; any forms or race schedule widgets depending on an API require a separate backend.
