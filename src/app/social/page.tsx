import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LinkedInProfile from "../components/linkedin/LinkedInProfile";
import UnifiedPostForm from "../components/UnifiedPostForm";
import Navbar from "../components/Navbar";

export default async function Social() {
    const session = await auth();
    if (!session?.user) {
      return redirect("/");
    }
    return (
      <main className="p-6 max-w-md mx-auto text-center">
        <Navbar />
        <LinkedInProfile />
        <UnifiedPostForm />
      </main>
    );
  }