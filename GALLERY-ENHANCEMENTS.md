# Gallery enhancements

- Single photo collection retained; existing `photos.js` untouched.
- Lightbox: keyboard arrows, touch swipe, photo counter, copy link, fullscreen, and URL deep linking (`gallery.html?photo=photo-n09.webp`).
- Sponsor showcase uses names and public Facebook links already present on the existing website; confirm sponsor permissions and details before publication.
- Follow CTA links to `index.html#social` (verify the anchor exists on your homepage), and sponsorship CTA to `sponsorship.html`.
- No third-party trackers, new dependencies, or paid services.
- Test on `http://localhost:8000/gallery.html` with `python -m http.server 8000`.
