import { NotFound as NotFoundPage } from "@rutopio/ui/not-found";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/hooks/use-lang";

export function NotFound() {
  const lang = useLang();
  return (
    <main className="flex flex-auto flex-col">
      <NotFoundPage homeLink={<Link to={lang === "en" ? "/en" : "/"} />} />
    </main>
  );
}
