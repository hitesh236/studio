import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  className?: string;
  variant?: 'default' | 'primary';
}

export function SummaryCard({ title, value, icon: Icon, className, variant = 'default' }: SummaryCardProps) {
  return (
    <Card className={cn(
      "shadow-lg hover:shadow-primary/20 transition-shadow",
      variant === 'primary' ? "bg-primary text-primary-foreground" : "bg-card",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className={cn(
          "text-sm font-medium",
          variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-[1.1rem] font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
