import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WordPressPublisher from "../components/wordpress/WordPressPublisher";
import Navbar from "../components/Navbar";

export default async function Blog() {
    const session = await auth();
    if (!session?.user) {
      return redirect("/");
    }
    return (
      <main className="p-6 max-w-md mx-auto text-center">
        <Navbar />
        <WordPressPublisher />
      </main>
    );
  }