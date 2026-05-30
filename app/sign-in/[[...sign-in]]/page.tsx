import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to RoadWatch">
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
