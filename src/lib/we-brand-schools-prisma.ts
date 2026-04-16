/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";

type WeBrandSchoolsPrismaDelegates = {
  weBrandSchoolsPageContent: any;
  schoolWebsiteTemplate: any;
  schoolWebsiteTemplateAsset: any;
  schoolWebsiteApplication: any;
};

export const weBrandSchoolsPrisma =
  prisma as typeof prisma & WeBrandSchoolsPrismaDelegates;
