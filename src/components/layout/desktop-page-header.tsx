import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DesktopPageHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
    // Opt-in: when this header's title is the page's single, true heading
    // (e.g. main listing pages), pass "h1" so it renders as a real <h1> for
    // SEO/accessibility. Defaults to a plain styled div (previous behavior)
    // to avoid creating duplicate/incorrect <h1>s on pages that already
    // have their own h1 elsewhere (e.g. ad detail pages).
    titleAs?: 'h1' | 'div';
}

export function DesktopPageHeader({ icon: Icon, title, description, className, titleAs = 'div' }: DesktopPageHeaderProps) {
    const titleClassName = "text-2xl font-bold text-primary";
    return (
        <div className={cn("hidden md:block container pt-6 pb-6", className)}>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                           <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-grow">
                            {titleAs === 'h1' ? (
                                <h1 className={titleClassName}>{title}</h1>
                            ) : (
                                <CardTitle className={titleClassName}>
                                    {title}
                                </CardTitle>
                            )}
                            <CardDescription className="mt-1 text-base">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
