import bloodImg from "@/assets/test-blood.jpg";
import vitaminImg from "@/assets/test-vitamin.jpg";
import heartImg from "@/assets/test-heart.jpg";
import thyroidImg from "@/assets/test-thyroid.jpg";
import organsImg from "@/assets/test-organs.jpg";
import pkgFullBody from "@/assets/pkg-full-body.jpg";
import pkgDiabetes from "@/assets/pkg-diabetes.jpg";
import pkgWomen from "@/assets/pkg-women.jpg";
import pkgSenior from "@/assets/pkg-senior.jpg";

export const BRAND = {
  name: "NUSFA DIAGNOSTIC",
  tagline: "Trusted Diagnostics, Closer to You",
  address: "Narainapur, Ramnagar, West Champaran, Bihar – 845106",
  phones: ["7808563842", "9065307353"],
  email: "nusfadiagnostic@gmail.com",
  whatsapp: "917808563842",
  mapEmbed:
    "https://www.google.com/maps?q=Ramnagar,+West+Champaran,+Bihar+845106&output=embed",
};

export interface TestFAQ { q: string; a: string }
export interface Test {
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  short: string;
  description: string;
  why: string;
  preparation: string;
  fasting: string;
  sampleType: string;
  reportTime: string;
  featured?: boolean;
  faqs: TestFAQ[];
}

const commonFaqs: TestFAQ[] = [
  { q: "Is home sample collection available?", a: "Yes, we offer free home sample collection across Ramnagar and nearby areas." },
  { q: "When will I receive my report?", a: "Reports are delivered digitally on email and WhatsApp within the stated turnaround time." },
  { q: "Are the tests accredited?", a: "All tests are conducted in our NABL-quality controlled lab with verified reagents." },
];

export const tests: Test[] = [
  {
    slug: "cbc-complete-blood-count",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    price: 250, mrp: 400,
    image: bloodImg,
    short: "Detect infections, anemia & many disorders with one quick test.",
    description: "A Complete Blood Count (CBC) measures hemoglobin, RBC, WBC, platelets and more — giving a complete snapshot of your overall blood health.",
    why: "Recommended as part of routine health checkups, to evaluate fatigue, infections, bleeding disorders, or as pre-surgical screening.",
    preparation: "No special preparation required. Stay well hydrated.",
    fasting: "Not required",
    sampleType: "Blood (2 ml EDTA)",
    reportTime: "Same day (within 6 hours)",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "vitamin-d-25-oh",
    name: "Vitamin D (25-OH)",
    category: "Vitamins",
    price: 899, mrp: 1500,
    image: vitaminImg,
    short: "Measure your Vitamin D levels — vital for bones & immunity.",
    description: "Quantifies 25-hydroxy Vitamin D, the most accurate marker of Vitamin D status in the body.",
    why: "Useful for bone pain, fatigue, hair loss, muscle weakness and to monitor supplementation.",
    preparation: "No fasting needed. Inform if on Vitamin D supplements.",
    fasting: "Not required",
    sampleType: "Blood (3 ml serum)",
    reportTime: "24 hours",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "vitamin-b12",
    name: "Vitamin B12",
    category: "Vitamins",
    price: 599, mrp: 900,
    image: vitaminImg,
    short: "Check B12 deficiency causing fatigue, tingling & memory issues.",
    description: "Measures serum Vitamin B12, essential for nerve function and red blood cell formation.",
    why: "Indicated in fatigue, numbness, vegetarians, elderly and patients on long-term acid blockers.",
    preparation: "No special preparation required.",
    fasting: "Not required",
    sampleType: "Blood (3 ml serum)",
    reportTime: "24 hours",
    faqs: commonFaqs,
  },
  {
    slug: "lipid-profile",
    name: "Lipid Profile",
    category: "Cardiac",
    price: 549, mrp: 900,
    image: heartImg,
    short: "Assess cholesterol & triglycerides to protect your heart.",
    description: "Includes Total Cholesterol, HDL, LDL, VLDL and Triglycerides.",
    why: "Screens for risk of heart disease, stroke and metabolic syndrome.",
    preparation: "12 hour overnight fasting required. Only water allowed.",
    fasting: "Required (10–12 hours)",
    sampleType: "Blood (3 ml serum)",
    reportTime: "Same day",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "kidney-function-test-kft",
    name: "Kidney Function Test (KFT)",
    category: "Organ Function",
    price: 599, mrp: 950,
    image: organsImg,
    short: "Check how well your kidneys are filtering & functioning.",
    description: "Includes Urea, Creatinine, Uric Acid, Sodium, Potassium, Chloride and Calcium.",
    why: "Essential for diabetics, hypertensives, and anyone on long-term medication.",
    preparation: "Stay hydrated. No fasting needed.",
    fasting: "Not required",
    sampleType: "Blood (3 ml serum)",
    reportTime: "Same day",
    faqs: commonFaqs,
  },
  {
    slug: "liver-function-test-lft",
    name: "Liver Function Test (LFT)",
    category: "Organ Function",
    price: 649, mrp: 1000,
    image: organsImg,
    short: "Evaluate liver enzymes, proteins & bilirubin levels.",
    description: "Includes Bilirubin, SGOT, SGPT, ALP, Total Protein, Albumin, Globulin.",
    why: "Recommended for jaundice, fatigue, alcohol use, or before starting hepatotoxic medication.",
    preparation: "Fasting preferred but not mandatory.",
    fasting: "Preferred (8 hours)",
    sampleType: "Blood (3 ml serum)",
    reportTime: "Same day",
    faqs: commonFaqs,
  },
  {
    slug: "thyroid-profile-total",
    name: "Thyroid Profile (T3, T4, TSH)",
    category: "Endocrinology",
    price: 449, mrp: 750,
    image: thyroidImg,
    short: "Detect thyroid disorders — hypo or hyperthyroidism.",
    description: "Measures Total T3, Total T4 and TSH to assess thyroid gland function.",
    why: "Recommended for weight changes, fatigue, hair loss, irregular periods.",
    preparation: "Morning sample preferred. Inform about thyroid medication.",
    fasting: "Not required",
    sampleType: "Blood (3 ml serum)",
    reportTime: "Same day",
    featured: true,
    faqs: commonFaqs,
  },
];

export interface Package {
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  short: string;
  includes: string[];
  benefits: string[];
  preparation: string;
  featured?: boolean;
  faqs: TestFAQ[];
}

export const packages: Package[] = [
  {
    slug: "full-body-checkup",
    name: "Full Body Checkup — Advanced",
    price: 1499, mrp: 3500,
    image: pkgFullBody,
    short: "75+ parameters covering all major organs & health markers.",
    includes: [
      "Complete Blood Count (CBC)", "Lipid Profile", "Liver Function Test",
      "Kidney Function Test", "Thyroid Profile", "Blood Sugar Fasting",
      "HbA1c", "Vitamin D", "Vitamin B12", "Urine Routine",
    ],
    benefits: [
      "Early detection of lifestyle diseases",
      "Comprehensive view of organ health",
      "Doctor consultation included",
      "Free home sample collection",
    ],
    preparation: "10–12 hours fasting required. Water allowed.",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "diabetes-care-package",
    name: "Diabetes Care Package",
    price: 799, mrp: 1500,
    image: pkgDiabetes,
    short: "Comprehensive diabetes monitoring with KFT & lipid screen.",
    includes: [
      "Fasting Blood Sugar", "Post Prandial Sugar", "HbA1c",
      "Kidney Function Test", "Lipid Profile", "Urine Microalbumin",
    ],
    benefits: ["Monitor glycemic control", "Detect early complications", "Track therapy effectiveness"],
    preparation: "10 hours fasting required.",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "women-wellness-package",
    name: "Women Wellness Package",
    price: 1299, mrp: 2800,
    image: pkgWomen,
    short: "Designed for women — hormones, iron, thyroid & more.",
    includes: [
      "CBC", "Thyroid Profile", "Vitamin D", "Vitamin B12",
      "Iron Studies", "Calcium", "Lipid Profile", "Urine Routine",
    ],
    benefits: ["Hormone balance screening", "Bone health assessment", "Anemia detection"],
    preparation: "Overnight fasting recommended.",
    featured: true,
    faqs: commonFaqs,
  },
  {
    slug: "senior-citizen-package",
    name: "Senior Citizen Care Package",
    price: 1899, mrp: 4200,
    image: pkgSenior,
    short: "Complete annual health screening for 55+ adults.",
    includes: [
      "CBC", "Diabetes Panel", "Lipid Profile", "Liver Function Test",
      "Kidney Function Test", "Thyroid Profile", "Vitamin D & B12",
      "ECG Interpretation", "Urine Routine",
    ],
    benefits: ["Whole-body annual checkup", "Cardiac & metabolic screening", "Doctor consultation included"],
    preparation: "10–12 hours fasting required.",
    featured: true,
    faqs: commonFaqs,
  },
];

export const categories = Array.from(new Set(tests.map(t => t.category)));

export function getTest(slug: string) { return tests.find(t => t.slug === slug); }
export function getPackage(slug: string) { return packages.find(p => p.slug === slug); }
export function relatedTests(slug: string, category: string) {
  return tests.filter(t => t.category === category && t.slug !== slug).slice(0, 3);
}
export function relatedPackages(slug: string) {
  return packages.filter(p => p.slug !== slug).slice(0, 3);
}
