import { signIn } from "@/auth"
 
export default function LinkAccount() {
  return (
    <form
      action={async () => {
       "use server"
        await signIn("", {redirectTo: "/profile"})
      }}
    >
      <button type="submit">link accounts!</button>
    </form>
  )
}   