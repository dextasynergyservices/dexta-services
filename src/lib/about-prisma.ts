/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";

type AboutPrismaDelegates = {
  aboutPageContent: any;
  aboutMilestone: any;
  aboutExpertiseItem: any;
  aboutTeamMember: any;
  aboutSpaceItem: any;
  aboutValueItem: any;
};

export const aboutPrisma = prisma as typeof prisma & AboutPrismaDelegates;
