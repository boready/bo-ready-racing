# Bo Ready Racing — GitHub Pages

This is the cleaned static website. Upload the **contents** of this ZIP to the root of your GitHub repository, then enable Settings → Pages → Deploy from branch → main → / (root).

The removed `website/`, `design-reference/`, `sponsor-command-center/`, and `admin/` directories were separate development/server projects or design copies, not needed to publish the static site. Keep the original combined ZIP as a backup if you later want to develop the sponsor dashboard or server-side geofencing.

GitHub Pages cannot execute Node.js server code or host a database. Dynamic sponsor APIs and analytics require separate backend hosting. The existing site code and references were not rewritten.

Some site metadata still contains `%%SITE_URL%%` placeholders; replace them with your published URL when ready.
