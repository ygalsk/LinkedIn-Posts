import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("", {redirectTo: "/profile"})
      }}
    >
      <button type="submit">Get started!</button>
    </form>
  )
} 