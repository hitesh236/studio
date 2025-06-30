import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
  variant?: 'default' | 'primary';
}

export function SummaryCard({ title, value, icon: Icon, description, className, variant = 'default' }: SummaryCardProps) {
  const isPositive = description?.startsWith('+');
  const isNegative = description?.startsWith('-');

  return (
    <Card className={cn(
      "shadow-sm hover:shadow-primary/20 transition-shadow",
      variant === 'primary' ? "bg-primary text-primary-foreground" : "bg-card",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
        <CardTitle className={cn(
          "text-xs font-medium tracking-wider uppercase",
          variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="text-xl font-bold">{value}</div>
        {description && (
          <p className={cn(
            "text-xs",
            variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground",
            isPositive && (variant === 'primary' ? "text-green-300" : "text-green-600"),
            isNegative && (variant === 'primary' ? "text-red-300" : "text-red-600"),
          )}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
