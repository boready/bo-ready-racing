# Ready Racing SEO deployment checklist

1. Replace every `https://boready.github.io/bo-ready-racing` placeholder across HTML, robots.txt and sitemap.xml with the actual public origin, e.g. `https://example.com` (no trailing slash). Existing original pages already contain this placeholder; leaving it unresolved breaks canonical and social metadata.
2. Publish the files at the same GitHub Pages site root. If publishing under a repository subpath, use the full site URL including the repository path for placeholders and review absolute links in /admin/.
3. Add the verified site to Google Search Console, submit `/sitemap.xml`, and inspect the blog and sponsorship URLs.
4. Keep new race recaps factual, unique, dated and useful. Add BlogPosting datePublished/dateModified when real articles are published. Do not invent race results or sponsor testimonials.
5. For sponsor features, obtain permission to publish business names, logos and photos. Use `rel="sponsored"` for paid outbound sponsor links when appropriate.
6. Measure organic traffic, contact clicks and sponsorship inquiries; search rankings are not guaranteed.
7. Blog posts are static HTML for fast GitHub Pages hosting. Add new article cards to blog.html and new URLs to sitemap.xml when publishing.
