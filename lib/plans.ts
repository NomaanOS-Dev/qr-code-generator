export const PLAN_LIMITS = {
  free: {
    maxQrCodes: 2,
    analyticsDays: 7,
    logoUpload: false,
    customDomains: false,
    teamMembers: 1,
    csvExport: false,
    price: 0,
  },
  starter: {
    maxQrCodes: 10,
    analyticsDays: 30,
    logoUpload: true,
    customDomains: false,
    teamMembers: 1,
    csvExport: false,
    price: 9,
  },
  pro: {
    maxQrCodes: 50,
    analyticsDays: 365,
    logoUpload: true,
    customDomains: true,
    teamMembers: 3,
    csvExport: true,
    price: 19,
  },
  agency: {
    maxQrCodes: 500,
    analyticsDays: 365,
    logoUpload: true,
    customDomains: true,
    teamMembers: 10,
    csvExport: true,
    price: 49,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS

export const PLAN_NAMES: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
}