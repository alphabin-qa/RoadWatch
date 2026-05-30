import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join RoadWatch in seconds">
      <SignUp
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
