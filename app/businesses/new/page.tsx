import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CreateListingForm } from "@/components/business/create-listing-form";

export default async function CreateListingPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8 md:py-12">
      <CreateListingForm />
    </main>
  );
}
