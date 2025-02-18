import { auth } from "@/auth";
import SignOut from "../components/sign-out";
import SignIn from "../components/sign-in";
import { redirect } from "next/navigation";
import LinkedInProfile from "../components/linkedin/LinkedInProfile";
import LinkedInPostForm from "../components/linkedin/LinkedInPostForm";
import WordPressPublisher from "../components/wordpress/WordPressPublisher";
import FacebookPostForm from "../components/facebook/FacebookPostForm";
import UnifiedPostForm from "../components/UnifiedPostForm";

export default async function Profile() {
    const session = await auth();
    if (!session?.user) {
      return redirect("/");
    }
    // session debug msg
    console.log(session);
    return (
      <main className="p-6 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-600">Welcome to your profile page!</p>
        <LinkedInProfile />
        {/* <LinkedInPostForm /> */}
        {/* <FacebookPostForm /> */}
        <WordPressPublisher />
        <UnifiedPostForm />
        <SignIn />
        <SignOut />
      </main>
    );
  }
  