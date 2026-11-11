import { AttributionFooter } from "@rutopio/ui/footer"
import { AUTHOR_PROFILE_URL } from "@/lib/constants"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <AttributionFooter
      className={className}
      repository={{
        href: "https://github.com/rutopio/intd",
        label: "rutopio/intd",
      }}
      author={{ href: AUTHOR_PROFILE_URL, label: "Created by ChingRu" }}
    />
  )
}
