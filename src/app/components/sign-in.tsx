import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("linkedin, facebook, wordpress, github", {redirectTo: "/profile"})
      }}
    >
      <button type="submit">Get started!</button>
    </form>
  )
} 