import { Link } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container py-16">
      <PageIntro
        eyebrow="404"
        title="That route is outside the current MVP shell."
        description="The cleanup pass removed scattered starter routes so implementation can continue from a smaller, role-based structure."
        actions={
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        }
      />
    </div>
  );
}
