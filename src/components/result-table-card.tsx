import { CopyIcon } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"
import { GlowCard } from "@/components/glow-card"
import { RollNumber } from "@/components/roll-number"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Item, keyOf } from "@/lib/decompose"
import { toRows } from "@/lib/rows"

// A single decomposition result rendered as a numbered card with its line-item
// table. position is the 1-based label shown in the badge.
export function ResultTableCard({
  item,
  position,
  nameColCh,
  bagName,
  onCopy,
}: {
  item: Item
  position: number
  nameColCh: number
  bagName: string
  onCopy: () => void
}) {
  const { t } = useTranslation()
  return (
    <GlowCard signature={keyOf(item)}>
      <Card className="h-full w-full rounded-md lg:w-auto lg:min-w-72">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Badge className="rounded-full">{position}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("home.copyTable")}
            className="text-muted-foreground"
            onClick={onCopy}
          >
            <CopyIcon aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="whitespace-nowrap"
                  style={{ minWidth: `${nameColCh}em` }}
                >
                  {t("home.colName")}
                </TableHead>
                <TableHead
                  className="pl-4 text-right"
                  style={{ minWidth: "6ch" }}
                >
                  {t("home.colQty")}
                </TableHead>
                <TableHead
                  className="pl-4 text-right"
                  style={{ minWidth: "7ch" }}
                >
                  {t("home.colPrice")}
                </TableHead>
                <TableHead
                  className="pl-4 text-right"
                  style={{ minWidth: "7ch" }}
                >
                  {t("home.colTotal")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toRows(item, bagName).map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="whitespace-nowrap">
                    {row.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap pl-4 text-right font-mono tabular-nums">
                    <RollNumber value={row.qty} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap pl-4 text-right font-mono tabular-nums">
                    <RollNumber value={row.price} prefix="$" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap pl-4 text-right font-mono tabular-nums">
                    <RollNumber value={row.total} prefix="$" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </GlowCard>
  )
}
