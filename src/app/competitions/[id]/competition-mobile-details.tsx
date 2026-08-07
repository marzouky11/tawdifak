
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays, Briefcase, Building, Users2, FileText, Link as LinkIcon,
  ClipboardList, Info, MapPin, Target, ListOrdered, FileUp, Award, Bookmark, Mail, HelpCircle, LayoutList, Clock
} from 'lucide-react';
import type { Competition } from '@/lib/types';
import { CategoryIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { ReportAdDialog } from '@/app/jobs/[id]/report-ad-dialog';
import { SaveAdButton } from '@/app/jobs/[id]/save-ad-button';
import { ShareButton } from '@/app/jobs/[id]/share-button';
import { getOrganizerByName } from '@/lib/data';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/ui/time-ago';

function getDaysRemaining(dateStr?: string): number | null {
  if (!dateStr) return null;
  const deadline = new Date(dateStr);
  if (isNaN(deadline.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const DeadlineBadge = ({ daysRemaining }: { daysRemaining: number | null }) => {
  if (daysRemaining === null) return null;
  const urgent = daysRemaining <= 3;
  const soon = daysRemaining > 3 && daysRemaining <= 7;
  const expired = daysRemaining < 0;

  return (
    <Badge
      className={cn(
        "gap-1.5 font-semibold border-0",
        expired && "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        !expired && urgent && "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300",
        !expired && soon && "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300",
        !expired && !urgent && !soon && "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {expired
        ? 'انتهى أجل التسجيل'
        : daysRemaining === 0
          ? 'آخر يوم للتسجيل اليوم!'
          : `متبقي ${daysRemaining} ${daysRemaining === 1 ? 'يوم' : 'أيام'} على آخر أجل`}
    </Badge>
  );
};
const InfoItem = ({ icon: Icon, label, value, color, href, isDate }: { icon: React.ElementType; label: string; value: string | number | undefined | null; color?: string; href?: string; isDate?: boolean }) => {
    if (!value) return null;

    const content = (
        <div className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border/60 h-full">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
                <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0 text-right">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className={cn("font-semibold text-sm truncate", isDate && "text-destructive")}>{String(value)}</dd>
            </div>
        </div>
    );
    
    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:scale-[1.02] transition-transform">{content}</a>;
    }
    return content;
};

const DetailSection = ({ icon: Icon, title, color, children }: { icon: React.ElementType, title: string, color?: string, children: React.ReactNode }) => {
    if (!children) return null;
    return (
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-3" style={{color}}>
                <Icon className="h-5 w-5" />
                {title}
            </h3>
            {children}
        </div>
    );
};

const FormattedText = ({ text, ordered = false }: { text?: string; ordered?: boolean }) => {
  if (!text || text.trim() === '') return <p className="italic text-muted-foreground">غير محدد</p>;

  const contentBlocks = text.split('\n').filter(line => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      const ListTag = ordered ? 'ol' : 'ul';
      elements.push(
        <ListTag key={key} className={cn("list-outside ms-6 my-4 space-y-2", ordered ? "list-decimal marker:font-bold marker:text-foreground" : "list-disc")}>
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ListTag>
      );
      listItems = [];
    }
  };

  contentBlocks.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.replace(/^[-*]\s*/, ''));
    } else if (ordered) {
      listItems.push(trimmed);
    } else {
      flushList(`ul-${i}`);
      elements.push(<p key={`p-${i}`} className="mb-4 last:mb-0">{trimmed}</p>);
    }
  });

  flushList('ul-end'); 

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none text-foreground">
      {elements}
    </div>
  );
};

interface CompetitionMobileDetailsProps {
    competition: Competition;
}

export function CompetitionMobileDetails({ competition }: CompetitionMobileDetailsProps) {
    const organizer = getOrganizerByName(competition.organizer);
    const sectionColor = '#14532d';
    const organizerIcon = organizer?.icon || 'Landmark';
    const organizerColor = organizer?.color || sectionColor;
    const daysRemaining = getDaysRemaining(competition.deadline);

    const descriptionSection = competition.description ? { id: 'description', icon: Info, title: "وصف تفصيلي", content: <FormattedText text={competition.description} /> } : null;

    const allOtherSections = [
        competition.availablePositions && { id: 'availablePositions', icon: Briefcase, title: "المناصب المتاحة", content: <FormattedText text={competition.availablePositions} /> },
        competition.requirements && { id: 'requirements', icon: ClipboardList, title: "الشروط المطلوبة", content: <FormattedText text={competition.requirements} /> },
        competition.documentsNeeded && { id: 'documentsNeeded', icon: FileText, title: "الوثائق المطلوبة", content: <FormattedText text={competition.documentsNeeded} /> },
        competition.competitionStages && { id: 'competitionStages', icon: ListOrdered, title: "مراحل المباراة", content: <FormattedText text={competition.competitionStages} /> },
        competition.trainingFeatures && { id: 'trainingFeatures', icon: Award, title: "مميزات التكوين والفرص", content: <FormattedText text={competition.trainingFeatures} /> },
        competition.jobProspects && { id: 'jobProspects', icon: Target, title: "أفق العمل بعد المباراة", content: <FormattedText text={competition.jobProspects} /> },
        ...(competition.extraSections || []).map(section => ({ id: `extra-${section.id}`, icon: LayoutList, title: section.title, content: <FormattedText text={section.content} /> })),
        competition.howToApply && { id: 'howToApply', icon: HelpCircle, title: "طريقة التسجيل", content: <FormattedText text={competition.howToApply} ordered /> }
    ].filter(Boolean) as { id: string; icon: React.ElementType; title: string; content: React.ReactNode; }[];
    
    const hasDetails = !!descriptionSection || allOtherSections.length > 0;

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-12 space-y-6">
            <Card className="overflow-hidden shadow-lg border-2 border-dashed" style={{borderColor: sectionColor}}>
                 <CardHeader className="p-4" style={{ backgroundColor: `${sectionColor}1A` }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10" style={{ backgroundColor: `${organizerColor}1A` }}>
                            <CategoryIcon name={organizerIcon} className="w-6 h-6" style={{ color: organizerColor }} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight leading-snug">
                            {competition.title || 'عنوان غير متوفر'}
                        </h1>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" />
                                <span>
                                    نُشرت: <TimeAgo date={competition.createdAtISO || new Date().toISOString()} initialText={competition.postedAt} />
                                </span>
                            </div>
                        </div>
                        <DeadlineBadge daysRemaining={daysRemaining} />
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                     <div className="grid grid-cols-2 gap-3 bg-muted/30 dark:bg-muted/10 border border-border/50 rounded-xl p-3">
                        <InfoItem icon={Building} label="الجهة المنظمة" value={competition.organizer} color={organizerColor} />
                        {competition.competitionType && <InfoItem icon={Briefcase} label="نوع المباراة" value={competition.competitionType} color={organizerColor} />}
                        {competition.location && <InfoItem icon={MapPin} label="الموقع" value={competition.location} color={organizerColor} />}
                        {competition.positionsAvailable && <InfoItem icon={Users2} label="عدد المناصب" value={competition.positionsAvailable} color={organizerColor} />}
                        <InfoItem icon={CalendarDays} label="بداية التسجيل" value={competition.registrationStartDate} color={organizerColor} />
                        <InfoItem icon={CalendarDays} label="آخر أجل للتسجيل" value={competition.deadline} color={organizerColor} isDate />
                        <InfoItem icon={CalendarDays} label="تاريخ المباراة" value={competition.competitionDate} color={organizerColor} />
                    </div>
                    
                    {hasDetails && (
                        <>
                            <Separator />
                            <div className="space-y-6">
                                {descriptionSection && (
                                    <DetailSection icon={descriptionSection.icon} title={descriptionSection.title} color={sectionColor}>
                                        {descriptionSection.content}
                                    </DetailSection>
                                )}

                                {allOtherSections.map((section, index) => (
                                    <React.Fragment key={section.id}>
                                        {(index > 0 || !!descriptionSection) && <Separator />}
                                        <DetailSection icon={section.icon} title={section.title} color={sectionColor}>{section.content}</DetailSection>
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <LinkIcon className="h-5 w-5" style={{ color: sectionColor }}/>
                        التقديم على المباراة
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 pt-0">
                     {competition.officialLink && (
                        <Button asChild size="lg" className="text-primary-foreground font-semibold text-base py-6 active:scale-95 transition-transform" style={{backgroundColor: sectionColor}}>
                            <a href={competition.officialLink} target="_blank" rel="noopener noreferrer" className="hover:opacity-90">
                                <LinkIcon className="ml-2 h-5 w-5" />
                                الذهاب إلى رابط التسجيل
                            </a>
                        </Button>
                    )}
                    {competition.fileUrl && (
                        <Button asChild size="lg" variant="outline" className="text-base py-6 active:scale-95 transition-transform font-semibold">
                            <a href={competition.fileUrl} target="_blank" rel="noopener noreferrer">
                                <FileUp className="ml-2 h-5 w-5" />
                                تحميل إعلان المباراة (PDF)
                            </a>
                        </Button>
                    )}
                     {competition.email && (
                        <Button asChild size="lg" variant="outline" className="text-base py-6 active:scale-95 transition-transform font-semibold">
                            <a href={`mailto:${competition.email}`}>
                                <Mail className="ml-2 h-5 w-5" />
                                التواصل عبر البريد الإلكتروني
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        
             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <Bookmark className="h-5 w-5" style={{ color: sectionColor }}/>
                        احفظ الإعلان وشارك مع الآخرين
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                    <SaveAdButton adId={competition.id} adType="competition" />
                    <ShareButton title={competition.title || ''} text={competition.description || ''} />
                </CardContent>
            </Card>

            <div className="text-center">
                <ReportAdDialog adId={competition.id} />
            </div>
        </div>
    );
}
