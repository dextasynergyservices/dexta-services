import { AdminHeader } from "@/components/admin/header";
import { getExpressions } from "./actions";
import { ExpressionsManager } from "./_components/expressions-manager";

export const metadata = {
  title: "Expressions — Admin",
};

export default async function ExpressionsPage() {
  const expressions = await getExpressions();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Our Expressions"
        description="Manage the portfolio expressions shown on the homepage — add logos, descriptions and links"
      />
      <ExpressionsManager expressions={expressions} />
    </div>
  );
}
