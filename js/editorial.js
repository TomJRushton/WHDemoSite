/* Willis Hazell — sample editorial content for the News and Careers templates.
   Every article and vacancy here is SAMPLE content that shows how the CMS collections behave.
   Facts about the practice come from willishazell.com (see content/current-site.json in the build repo);
   anything in [square brackets] is a placeholder for Willis Hazell to supply. Dates are sample dates. */
window.WH_EDITORIAL = {
  authors: {
    "martin-willis": { name: "Martin Willis", role: "Co-founder", url: "about.html" },
    "rob-hazell": { name: "Rob Hazell", role: "Co-founder", url: "about.html" }
  },

  newsCategories: ["Project Updates", "Completions", "Appointments", "Team News", "Insights"],

  /* News collection. Fields mirror the brief's §7.5 model: title, slug, date, category, summary,
     body (rich content), hero image, gallery, LinkedIn post link, author, related projects, SEO. */
  articles: [
    {
      slug: "designing-for-low-embodied-carbon",
      title: "Designing sports venues for low embodied carbon",
      date: "2026-11-02",
      category: "Insights",
      featured: true,
      author: "rob-hazell",
      summary: "Why we track embodied carbon on every design, and where the largest savings in a stadium structure usually sit.",
      image: { name: "structural", maxW: 1200, alt: "Long-span roof steelwork being lifted into place on a stadium" },
      relatedProjects: ["ashton-gate", "racecourse-ground-kop-stand"],
      linkedin: null,
      body: [
        ["p", "Willis Hazell tracks embodied carbon on all of its designs, with the aim of delivering the lowest feasible carbon outcome for each scheme."],
        ["ph", "[Article to be written by Rob Hazell: how embodied carbon is measured on a project, which structural decisions move the figure most, and an example from a current scheme with numbers the client has approved for publication.]"],
        ["h2", "Where the carbon sits"],
        ["ph", "[Two or three paragraphs. Suggested angle: frame, foundations and roof as the main contributors, and how early optioneering changes them.]"],
        ["figure", "Supporting image: carbon comparison diagram or construction photograph"],
        ["h2", "Testing the design with the supply chain"],
        ["ph", "[One or two paragraphs on validating lower-carbon options with contractors so that they stay buildable and within budget.]"]
      ]
    },
    {
      slug: "green-guide-annual-inspections",
      title: "Green Guide annual inspections: what venue owners should plan for",
      date: "2026-10-14",
      category: "Insights",
      author: "martin-willis",
      summary: "A short guide to the annual structural inspection and appraisal cycle for spectator venues.",
      image: null,
      relatedProjects: ["racecourse-ground-kop-stand", "ashton-gate"],
      linkedin: null,
      body: [
        ["p", "Willis Hazell carries out Green Guide annual inspections and structural appraisals for stadia, in line with Sports Grounds Safety Authority (SGSA) guidance."],
        ["ph", "[Article to be written by Martin Willis: what the annual inspection covers, what owners should have ready, and the common findings that lead to remedial work. Technical statements to be checked against the current edition of the Green Guide before publication.]"],
        ["h2", "Before the inspection"],
        ["ph", "[Checklist-style paragraph for venue operators.]"],
        ["h2", "After the inspection"],
        ["ph", "[How findings are reported and prioritised.]"]
      ]
    },
    {
      slug: "practice-founded",
      title: "Willis Hazell Engineers: a specialist practice for sport and leisure",
      date: "2026-09-22",
      category: "Team News",
      author: "martin-willis",
      summary: "Martin Willis and Rob Hazell set up the practice in 2023 to focus on sports, entertainment and leisure venues.",
      image: null,
      relatedProjects: [],
      linkedin: null,
      body: [
        ["p", "Willis Hazell Engineers was set up in 2023 by Martin Willis and Rob Hazell, both Chartered Structural Engineers, to provide structural and civil engineering for the sports, entertainment and leisure sector."],
        ["p", "Martin was previously Director and Head of Sport at Ramboll. Rob has over 25 years’ contractor and consultancy experience, mainly in sport and leisure."],
        ["ph", "[Quote from the founders on why they set up the practice, to be supplied and approved by Martin and Rob.]"]
      ]
    },
    {
      slug: "sample-project-update",
      title: "[Project name]: [milestone reached]",
      date: "2026-08-30",
      category: "Project Updates",
      author: "rob-hazell",
      summary: "[One-sentence summary of the milestone, the client and Willis Hazell’s role.]",
      image: null,
      relatedProjects: [],
      linkedin: null,
      body: [
        ["ph", "[Project update: what has happened on site, what Willis Hazell designed, and what comes next. Link the article to the project record so it appears on the case study.]"]
      ]
    },
    {
      slug: "sample-appointment",
      title: "[Name] joins Willis Hazell as [role]",
      date: "2026-07-18",
      category: "Appointments",
      author: "martin-willis",
      summary: "[One-sentence introduction to the new team member and their background.]",
      image: null,
      relatedProjects: [],
      linkedin: null,
      body: [
        ["ph", "[Appointment announcement: background, specialisms and the projects they will work on. Link to their People profile once published.]"]
      ]
    },
    {
      slug: "sample-completion",
      title: "[Project name] completes",
      date: "2026-06-05",
      category: "Completions",
      author: "rob-hazell",
      summary: "[One-sentence summary of the completed project and its key figures.]",
      image: null,
      relatedProjects: [],
      linkedin: null,
      body: [
        ["ph", "[Completion story: the brief, the engineering response and the finished venue, with approved photography.]"]
      ]
    }
  ],

  /* Jobs collection (brief §7.7). status: draft | published | closed.
     A published role is listed only from publishAt until the end of its closing date. */
  jobs: [
    {
      slug: "structural-engineer",
      title: "Structural Engineer",
      status: "published",
      publishAt: "2026-11-02",
      closing: "2027-02-26",
      location: "[Location to confirm]",
      type: "Full-time, permanent",
      salary: null,
      summary: "Design of new and existing structures for stadia, arenas, training grounds and leisure venues.",
      description: [
        ["p", "Willis Hazell Engineers provides structural and civil engineering for the sports, entertainment and leisure sector, from feasibility and concept design through to detailed design."],
        ["ph", "[Role description to be written by Willis Hazell: the projects the role will work on, who it reports to and the stages of work involved.]"]
      ],
      requirements: ["[Requirement to be supplied, e.g. qualification]", "[Requirement to be supplied, e.g. experience]", "[Requirement to be supplied, e.g. software]"],
      benefits: null,
      howToApply: "Apply with the form below. Attach your CV as a PDF or Word document (up to 10MB) and add a short cover note."
    },
    {
      slug: "civil-engineer",
      title: "Civil Engineer",
      status: "published",
      publishAt: "2026-09-01",
      closing: "2026-10-30",
      location: "[Location to confirm]",
      type: "Full-time, permanent",
      salary: null,
      summary: "Earthworks, drainage and highways design for sports and leisure sites.",
      description: [["ph", "[Sample closed role. Its closing date has passed, so it no longer appears in the open vacancies list.]"]],
      requirements: [],
      benefits: null,
      howToApply: ""
    },
    {
      slug: "senior-structural-engineer",
      title: "Senior Structural Engineer",
      status: "draft",
      publishAt: null,
      closing: "2027-03-31",
      location: "[Location to confirm]",
      type: "Full-time, permanent",
      salary: null,
      summary: "[Sample draft role. Drafts are never shown on the site.]",
      description: [], requirements: [], benefits: null, howToApply: ""
    },
    {
      slug: "engineering-technician",
      title: "Engineering Technician",
      status: "published",
      publishAt: "2027-01-11",
      closing: "2027-03-12",
      location: "[Location to confirm]",
      type: "Full-time, permanent",
      salary: null,
      summary: "[Sample scheduled role. It appears automatically on its publication date.]",
      description: [["ph", "[Sample scheduled role.]"]],
      requirements: [], benefits: null,
      howToApply: "Apply with the form below. Attach your CV as a PDF or Word document (up to 10MB) and add a short cover note."
    }
  ]
};
