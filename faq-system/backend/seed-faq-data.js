/**
 * seed-faq-data.js
 * Seeds realistic mock FAQs per category for treemap demo.
 * Run: node seed-faq-data.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const mongoose = require("mongoose");
const Faq = require("./models/Faq");
const User = require("./models/User");

const CATEGORY_FAQS = {
  "About the Internship": [
    { question: "What is the duration of the IIT Ropar internship?", answer: "The internship typically runs for 6 months, starting from the date mentioned in your offer letter." },
    { question: "Is the internship mandatory for all students?", answer: "Yes, the internship is a mandatory component of the academic program at IIT Ropar." },
    { question: "Can I do the internship at my hometown?", answer: "Internships are processed through the institute; remote internships are allowed only with prior approval." },
    { question: "What are the eligibility criteria?", answer: "Students must have completed at least 4 semesters and maintain a minimum CPI of 6.0." },
    { question: "Will I receive a stipend during the internship?", answer: "Stipend varies by company. Check your offer letter for specific details." },
    { question: "How do I apply for internship extension?", answer: "Submit a formal request through the internship portal at least 2 weeks before the end date." },
    { question: "What happens if I leave the internship early?", answer: "Early exit requires written approval from both the mentor and the institute; failure to do so may affect your grade." },
  ],
  "Timing and Dates": [
    { question: "When do internship offers typically get released?", answer: "Offers are usually released between March and April for the summer cycle." },
    { question: "What is the last date to accept an internship offer?", answer: "You must respond within 7 days of receiving the offer letter." },
    { question: "When does the internship commencement date start?", answer: "Most internships begin in the first week of June, unless specified otherwise." },
    { question: "Are there any pre-internship deadlines?", answer: "Yes, you must submit NOC and complete onboarding at least 5 days before start date." },
    { question: "What is the final submission deadline for internship reports?", answer: "Final reports must be submitted by September 30th of the same year." },
  ],
  "NOC": [
    { question: "How do I request an NOC from the institute?", answer: "Log in to the internship portal, fill out the NOC request form, and submit it to the placement cell." },
    { question: "Who needs to sign the NOC?", answer: "The NOC must be signed by the Head of Department (HOD) or the Placement Officer." },
    { question: "What documents are required for NOC processing?", answer: "Offer letter, company acceptance email, and a filled NOC request form are required." },
    { question: "How long does NOC processing take?", answer: "NOC processing takes 3-5 working days under normal circumstances." },
    { question: "Can I get an urgent NOC for last-minute offers?", answer: "Urgent NOC requests can be raised via email to the placement officer with supporting documents." },
  ],
  "Selection and Offer Letter": [
    { question: "How will I receive my offer letter?", answer: "Offer letters are sent via email from the company's HR department and also uploaded to the portal." },
    { question: "What should I do after receiving the offer?", answer: "Accept the offer on the portal and start the onboarding process as per the company's instructions." },
    { question: "Can I negotiate the terms of my offer letter?", answer: "Salary and start date are typically non-negotiable once an offer is made." },
    { question: "Is the offer letter legally binding?", answer: "Yes, once accepted, the offer letter constitutes a legal agreement between you and the company." },
  ],
  "Work and Mentorship": [
    { question: "How often should I meet with my assigned mentor?", answer: "Weekly check-ins with your mentor are recommended. At minimum, bi-weekly meetings are expected." },
    { question: "What should I do if my mentor is unresponsive?", answer: "Notify the program coordinator immediately and CC the placement cell." },
    { question: "Will I be assigned a project during the internship?", answer: "Most companies assign a project or a set of tasks. Check with your mentor in the first week." },
    { question: "Can I switch mentors during the internship?", answer: "Mentor switches require a valid reason and approval from the program coordinator." },
    { question: "What tools and software will I need for remote work?", answer: "Check with your company. Common tools include Slack, Zoom, GitHub, and VPN access." },
  ],
  "Communication Channels": [
    { question: "Which communication platform is used for official updates?", answer: "Official updates are communicated via the institute email and the internship portal." },
    { question: "How do I reach the program coordinator?", answer: "Email the coordinator at internship@iitrpr.ac.in or use the portal's support ticket system." },
    { question: "Is there a WhatsApp group for interns?", answer: "The institute does not use WhatsApp for official communication. Use email or the portal instead." },
  ],
  "Interviews": [
    { question: "How many rounds of interviews should I expect?", answer: "Typically 2 rounds: a technical interview and an HR interview. Some companies may have more." },
    { question: "What is the interview format for IIT Ropar interns?", answer: "Interviews are conducted online via video call (Zoom/Google Meet) or in-person depending on the company." },
    { question: "How do I prepare for the technical interview round?", answer: "Focus on core CS fundamentals, your projects, and any domain-specific knowledge relevant to the role." },
  ],
  "Certificate": [
    { question: "When will I receive my internship completion certificate?", answer: "Certificates are issued within 4 weeks after submission of the final report and mentor feedback." },
    { question: "What is the format of the internship certificate?", answer: "The certificate includes your name, company name, internship period, and the director's signature." },
    { question: "Can I get an interim certificate for my records?", answer: "An interim certificate can be issued upon request after 3 months of completed internship." },
    { question: "Who signs the final internship certificate?", answer: "The institute director and the placement cell coordinator sign the certificate." },
  ],
  "Rosetta": [
    { question: "What is Rosetta in the context of this internship?", answer: "Rosetta is the submission and tracking portal used by IIT Ropar for internship document management." },
    { question: "How do I upload documents to Rosetta?", answer: "Log in to Rosetta at rosetta.iitrpr.ac.in, navigate to Phase 1 submissions, and upload your PDF documents." },
    { question: "What file formats are accepted on Rosetta?", answer: "Only PDF files are accepted. Word documents must be converted to PDF before uploading." },
    { question: "Can I edit my submission on Rosetta after uploading?", answer: "You can edit submissions before the deadline. Once the deadline passes, uploads are frozen." },
  ],
  "Phase 1 and Coursework": [
    { question: "What is Phase 1 of the internship program?", answer: "Phase 1 covers the initial onboarding, NOC submission, and orientation sessions before the internship starts." },
    { question: "Are there any coursework requirements during the internship?", answer: "Yes, you must complete weekly progress reports and a mid-term evaluation form on the portal." },
    { question: "How do I submit my weekly progress reports?", answer: "Submit weekly reports via the internship portal under the 'Progress Reports' section every Friday." },
    { question: "What is the mid-term evaluation?", answer: "The mid-term evaluation occurs at the 3-month mark, where your mentor submits feedback on your performance." },
  ],
  "Yaksha Chat": [
    { question: "What is the Yaksha Chat platform?", answer: "Yaksha Chat is an internal communication tool used by IIT Ropar for student-faculty interaction during the internship." },
    { question: "How do I access Yaksha Chat?", answer: "Yaksha Chat is accessible through the institute's learning management system at lms.iitrpr.ac.in." },
    { question: "Is Yaksha Chat monitored by admins?", answer: "Messages may be reviewed for compliance with institute policies. Keep communication professional." },
  ],
  "ViBe Platform": [
    { question: "What is the ViBe platform?", answer: "ViBe is a virtual internship management platform that tracks your attendance, tasks, and deliverables." },
    { question: "How do I mark my daily attendance on ViBe?", answer: "Log in to ViBe at vibe.iitrpr.ac.in and mark attendance before 10 AM every working day." },
    { question: "What happens if I miss marking attendance?", answer: "Unexplained absences are flagged and must be reported to your mentor within 24 hours." },
    { question: "Can I use ViBe on my mobile phone?", answer: "Yes, ViBe has a mobile-responsive web interface accessible from any browser." },
  ],
  "Team Formation": [
    { question: "Are internship projects done individually or in teams?", answer: "Most internship projects are individual. Some companies may assign team projects during the final phase." },
    { question: "Can I form a team with students from other disciplines?", answer: "Interdisciplinary teams are allowed only if the company approves it in writing." },
    { question: "How are teams assigned for group internship projects?", answer: "Team formation is coordinated by the company mentor; the institute does not assign teams." },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/faq-system");
    console.log("[seed] Connected to MongoDB");

    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.warn("[seed] No admin user found. FAQs will be seeded without a verified author.");
    }
    const authorId = adminUser?._id;

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const [category, faqs] of Object.entries(CATEGORY_FAQS)) {
      for (const faq of faqs) {
        // Check for duplicate
        const existing = await Faq.findOne({ question: faq.question });
        if (existing) {
          totalSkipped++;
          console.debug(`[seed] Skipping duplicate: ${faq.question.substring(0, 40)}...`);
          continue;
        }

        const newFaq = new Faq({
          question: faq.question,
          answer: faq.answer,
          category,
          upvotes: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 200),
          author: authorId,
          approved: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });

        await newFaq.save();
        totalCreated++;
        console.log(`[seed] Created FAQ: [${category}] ${faq.question.substring(0, 50)}`);
      }
    }

    console.log(`\n[seed] Done. Created: ${totalCreated} | Skipped (already exists): ${totalSkipped}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("[seed] Error:", err.message);
    process.exit(1);
  }
}

seed();