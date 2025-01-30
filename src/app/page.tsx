import SignIn from "./components/sign-in";

export default function Home() {
  console.log('WordPress Client ID:', process.env.AUTH_WORDPRESS_ID)
  console.log('WordPress Client Secret:', process.env.AUTH_WORDPRESS_SECRET)
  return (
    <main>
      <h1>Welcome</h1>
      <SignIn />
    </main>
  );
}