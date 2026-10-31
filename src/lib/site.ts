// Single source of truth for site copy. Text marked PLACEHOLDER is for the group to replace.

export const site = {
  name: "Liwanag",
  // PLACEHOLDER: replace with the group's own tagline
  tagline: "Where healing begins with light.",
  // PLACEHOLDER
  mission:
    "To give every student a safe, stigma-free place to be heard, supported, and guided toward the care they need, one gentle step at a time.",
  // PLACEHOLDER
  vision:
    "A school community where asking for mental health support is as ordinary as asking for help with homework, and no one has to face the dark alone.",
  // PLACEHOLDER
  intro: [
    "Liwanag is Filipino for “light.” We are a mental health clinic built around one idea: reaching out should feel safe, simple, and kind.",
    "Here you can learn what we offer, complete our intake and feedback forms online, and find who to contact, whether you want to talk to someone this week or just want to understand your options.",
  ],
  disclaimer:
    "Liwanag is not an emergency service. If you or someone you know needs help right now, contact one of the hotlines on the Contact page.",
} as const;

export const principles = [
  { name: "Safety first", text: "Your story stays private, and you decide what you share." },
  { name: "No judgment", text: "Every concern is valid, whether it feels big or small." },
  { name: "Small steps", text: "Progress is gentle and at your pace. There is no wrong place to start." },
  { name: "Hope", text: "Feeling better is possible, and you do not have to get there alone." },
] as const;

export const services = [
  {
    name: "Individual Counseling",
    description:
      "One-on-one, confidential sessions with a counselor in a safe and unhurried space.",
    audience: "Students and young adults",
  },
  {
    name: "Group Support Sessions",
    description:
      "Guided small-group conversations where members share experiences and learn from one another.",
    audience: "Anyone seeking community",
  },
  {
    name: "Stress and Anxiety Workshops",
    description:
      "Practical, hands-on sessions on coping skills, time management, and calming techniques.",
    audience: "Students facing academic pressure",
  },
  {
    name: "Peer Support Circle",
    description: "Trained peer volunteers offer a listening ear and gentle guidance.",
    audience: "Students",
  },
  {
    name: "Mindfulness and Relaxation",
    description: "Breathing, grounding, and guided relaxation sessions to restore calm.",
    audience: "Everyone",
  },
  {
    name: "Academic and Career Counseling",
    description: "Support for school stress, goal setting, and planning your next steps.",
    audience: "Students",
  },
  {
    name: "Crisis Referral and Guidance",
    description:
      "Immediate guidance and referral to emergency hotlines and partner professionals.",
    audience: "Anyone in distress",
  },
  {
    name: "Psycho-educational Talks",
    description:
      "Informative talks that reduce stigma and build mental health awareness in schools.",
    audience: "Schools and organizations",
  },
] as const;

// The order a client moves through the forms (see PRD section 5.4).
export const formSteps = [
  { name: "Consent", href: "/forms/consent", text: "Tell us you are ready, and what you agree to." },
  { name: "Data Privacy", href: "/forms/privacy", text: "See how your information is kept safe." },
  { name: "Interview", href: "/forms/interview", text: "Share what brings you here, in your own words." },
  { name: "Assessment", href: "/forms/assessment", text: "A short check-in to understand how you are doing." },
  { name: "Exit", href: "/forms/exit", text: "Tell us how it went, so we can do better." },
] as const;

// PLACEHOLDER: replace with the clinic's real contact details
export const contact = {
  email: "hello@liwanag.example",
  phone: "(000) 000-0000",
  address: "Student Wellness Room, Main Building",
  hours: "Monday to Friday, 9:00 AM to 4:00 PM",
} as const;

// VERIFY these numbers against official sources before publishing.
export const hotlines = [
  { name: "NCMH Crisis Hotline", numbers: ["1553", "0966-351-4518", "0917-899-8727"] },
  { name: "Hopeline Philippines", numbers: ["(02) 8804-4673", "0917-558-4673"] },
] as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Forms", href: "/forms" },
  { label: "Testimonies", href: "/testimonies" },
  { label: "Contact", href: "/contact" },
] as const;

export const featuredTestimony = {
  quote:
    "I came in overwhelmed and left feeling heard. The team made it easy to take the first step.",
  by: "Anonymous student",
} as const;
