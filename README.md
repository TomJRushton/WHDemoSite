# Willis Hazell — demo site

Clickable prototype of a proposed new website for Willis Hazell Engineers. Static HTML, CSS and JS; no build step.

**Demo only.** Content and images come from the current willishazell.com. Project credits (Willis Hazell or team experience at previous practices), figures and imagery are still to be confirmed with the client. The hero footage is stock demo footage, not a Willis Hazell project.

Pages: `index.html` (Home), `projects.html` (search and filters), `project.html?p=…` (case study), `about.html` (Who We Are).

Published with GitHub Pages from `main` / root.

## News & Careers (branch `stage8/news-careers`)

- `news.html`: news index with a featured story, category filter (`?category=insights`) and Show more.
- `article.html?a=<slug>`: article template with author, hero, body, related projects, related articles and share links (LinkedIn share URL, email, copy link). There's no LinkedIn API or scraping.
- `careers.html`: open vacancies and a "Working at Willis Hazell" section. Culture, development, benefits and environment are placeholders, so no workplace claims are invented.
- `job.html?r=<slug>`: job details and an application form. The form validates the CV as PDF or Word, up to 10MB. It's a prototype: nothing is sent or stored.
- Sample content lives in `js/editorial.js`. Every article and role is marked **Sample**.
- **Vacancy rules:**
  - `draft` roles are never shown.
  - Published roles appear from `publishAt`.
  - Roles leave the list after `closing`.
  - A closed or expired role's URL stays live with a "This vacancy has closed" notice. Drafts, scheduled roles and unknown slugs show "Vacancy not found".
  - Add `?asof=YYYY-MM-DD` to preview another date.
