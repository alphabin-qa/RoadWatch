import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join RoadWatch in seconds">
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
