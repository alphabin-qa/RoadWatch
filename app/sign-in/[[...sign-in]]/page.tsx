import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to RoadWatch">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "w-full shadow-none border-none bg-transparent p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            footer: "bg-transparent",
          },
        }}
      />
    </AuthShell>
  );
}
