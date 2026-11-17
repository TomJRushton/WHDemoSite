/* Willis Hazell — Services collection (SERV-010).
   Hand-authored content file, like js/editorial.js. js/data.js stays generated and untouched.
   Fields from brief §7.3: name, slug, summary, intro (description), capabilities, image, seo, sectors, projects.
   Recommended extensions: order, status (draft | published), confirmed, image.alt / image.credit,
   related (services), per-project evidence, topics, capsSource, article.
   Only records with status "published" are shown anywhere on the site.
   sectors: derived from the sectors of the case studies whose key inputs show the service (evidence-based; to be confirmed by Willis Hazell).
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
      "sectors": ["Stadia", "Arenas", "Leisure Centres", "Training Grounds"],
      "related": [
        "civil-engineering",
        "inspections-appraisals"
      ],
      "seo": {
        "title": "Structural Engineering for Sports, Entertainment and Leisure Venues",
        "description": "Structural engineering for stadia, arenas, training grounds and leisure venues: new and existing structures, lightweight and temporary structures, buildability and embodied carbon."
      }
    },
    {
      "slug": "civil-engineering",
      "name": "Civil Engineering",
      "order": 2,
      "status": "published",
      "confirmed": true,
      "summary": "Earthworks, drainage, flood risk, highways and site appraisals for sports, entertainment and leisure developments.",
      "intro": [
        [
          "ph",
          "[Service introduction to be written with Willis Hazell: the site and infrastructure work the practice designs, and how it is coordinated with the structural design.]"
        ]
      ],
      "capabilities": [
        {
          "title": "Earthworks design and modelling"
        },
        {
          "title": "Flood risk assessment and mitigation"
        },
        {
          "title": "Foul and surface water underground drainage"
        },
        {
          "title": "Road and highways design"
        },
        {
          "title": "Site appraisals"
        }
      ],
      "image": {
        "name": "civil",
        "maxW": 528,
        "w": 528,
        "h": 450,
        "alt": "Aerial view of a building and its landscaped external works",
        "credit": "Image from willishazell.com; credit to confirm"
      },
      "sectors": ["Stadia", "Arenas", "Leisure Centres", "Training Grounds"],
      "related": [
        "structural-engineering"
      ],
      "seo": {
        "title": "Civil Engineering for Sports and Leisure Developments",
        "description": "Civil engineering for sports, entertainment and leisure developments: earthworks, flood risk, drainage, highways and site appraisals.",
        "note": "Specification target phrase 'sports pitch civil engineer' is not used until Willis Hazell supplies confirmed pitch-related content."
      }
    },
    {
      "slug": "inspections-appraisals",
      "name": "Inspections & Appraisals",
      "order": 3,
      "status": "published",
      "confirmed": true,
      "summary": "SGSA Green Guide annual inspections and structural appraisals of existing spectator venues.",
      "intro": [
        [
          "p",
          "Willis Hazell carries out Green Guide annual inspections and structural appraisals, listed on its current website alongside its structural engineering services."
        ],
        [
          "ph",
          "[Service introduction to be written with Willis Hazell: who commissions the inspections, how often, and what the client receives. Technical and regulatory statements to be checked against the current Green Guide and SGSA guidance before publication.]"
        ]
      ],
      "capsSource": "From willishazell.com: its services list and the key inputs on its case studies",
      "capabilities": [
        {
          "title": "Green Guide annual inspections"
        },
        {
          "title": "Structural appraisals"
        },
        {
          "title": "Condition surveys and capacity assessments"
        }
      ],
      "topics": [
        {
          "title": "Stadium inspections",
          "text": "[What a stadium inspection by Willis Hazell covers. To be supplied.]"
        },
        {
          "title": "Structural appraisals",
          "text": "[Appraisals of existing structures: scope and typical outputs. To be supplied.]"
        },
        {
          "title": "Green Guide and SGSA annual inspections",
          "text": "[How the annual inspection relates to the Green Guide and SGSA guidance. To be written by Willis Hazell and verified before publication; no regulatory claims are made here.]"
        }
      ],
      "image": {
        "name": "ashton-gate",
        "maxW": 529,
        "w": 529,
        "h": 450,
        "alt": "Aerial view of Ashton Gate stadium, Bristol",
        "credit": "Image from willishazell.com; credit to confirm"
      },
      "sectors": ["Stadia"],
      "related": [
        "structural-engineering"
      ],
      "article": "green-guide-annual-inspections",
      "seo": {
        "title": "Green Guide Inspections and Structural Appraisals",
        "description": "Green Guide annual inspections, stadium inspections and structural appraisals of existing spectator venues, from Willis Hazell Engineers."
      }
    },
    {
      "slug": "geotechnical-engineering",
      "name": "Geotechnical Engineering",
      "order": 4,
      "status": "draft",
      "confirmed": false,
      "summary": "[Unconfirmed. The specification lists this service as subject to confirmation. Not shown on the site while status is draft.]",
      "intro": [],
      "capabilities": [],
      "image": null,
      "related": [],
      "seo": {
        "title": "",
        "description": ""
      }
    }
  ]
};
