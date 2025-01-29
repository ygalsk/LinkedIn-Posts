import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("linkedin", {redirectTo: "/profile"})
      }}
    >
      <button type="submit">Signin with LinkedIn</button>
    </form>
  )
} 