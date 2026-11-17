/* Willis Hazell — Services collection (SERV-010).
   Hand-authored content file, like js/editorial.js. js/data.js stays generated and untouched.
   Fields from brief §7.3: name, slug, summary, intro (description), capabilities, image, seo, sectors, projects.
   Recommended extensions: order, status (draft | published), confirmed, image.alt / image.credit,
   related (services), per-project evidence, topics, capsSource, article.
   Only records with status "published" are shown anywhere on the site.
   Sources: willishazell.com services lists and case-study key inputs (checked 2026-11-17).
   [Square brackets] mark content for Willis Hazell to supply. Project credits remain unconfirmed. */
window.WH_SERVICES = {
  /* The practice's four principles, worded exactly as on about.html (from willishazell.com) */
  principles: [
    { title: "We challenge", text: "We question conventional approaches and test assumptions with architects, clients and designers, looking for lower cost, lower embodied carbon, shorter programmes, reduced risk and added value." },
    { title: "We design to meet your budget", text: "We work to understand the financial drivers, build realistic cost plans and test our designs with the supply chain." },
    { title: "We produce designs to be built", text: "Buildability is central from the start: simple, efficient construction sequences, validated with contractors." },
    { title: "We design for low carbon", text: "We track embodied carbon on all our designs to deliver the lowest feasible carbon outcome." }
  ],
  services: [
    {
      "slug": "structural-engineering",
      "name": "Structural Engineering",
      "order": 1,
      "status": "published",
      "confirmed": true,
      "summary": "Engineering design of new and existing structures across the sports, entertainment and leisure sector.",
      "intro": [
        [
          "p",
          "Willis Hazell is a specialist structural engineering consultancy for the sports, entertainment and leisure sector, set up in 2023 by two Chartered Structural Engineers."
        ],
        [
          "ph",
          "[Service introduction to be written with Willis Hazell: the structures the practice designs, the stages it works across, and who usually appoints it.]"
        ]
      ],
      "capabilities": [
        {
          "title": "Engineering design of new and existing structures"
        },
        {
          "title": "Lightweight and temporary structures design"
        },
        {
          "title": "Construction methodology and buildability advice"
        },
        {
          "title": "Client Technical Advisor role"
        },
        {
          "title": "Embodied carbon tracking"
        },
        {
          "title": "Green Guide annual inspections and structural appraisals",
          "service": "inspections-appraisals"
        }
      ],
      "image": {
        "name": "structural",
        "maxW": 1200,
        "w": 1200,
        "h": 898,
        "alt": "Long-span roof steelwork being lifted into place on a stadium",
        "credit": "Image from willishazell.com; credit to confirm"
      },
      "related": [
        "civil-engineering",
        "inspections-appraisals"
      ],
      "seo": {
        "title": "Structural Engineering for Sports, Entertainment and Leisure Venues",
        "description": "Structural engineering for stadia, arenas, training grounds and leisure venues: new and existing structures, lightweight and temporary structures, buildability and embodied carbon."
      }
    }
  ]
};
