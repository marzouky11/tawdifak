
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarDays, Target, Link as LinkIcon, ClipboardList, Info, MapPin,
  GraduationCap, Briefcase, Users, Award, Wallet, HelpCircle, Mail, MessageSquare,
  Instagram, Phone, Bookmark, CheckSquare, LayoutGrid, LayoutList, Plane
} from 'lucide-react';
import type { ImmigrationPost } from '@/lib/types';
import { ReportAdDialog } from '@/app/jobs/[id]/report-ad-dialog';
import { SaveAdButton } from '@/app/jobs/[id]/save-ad-button';
import { CategoryIcon } from '@/components/icons';
import { getProgramTypeDetails, cn } from '@/lib/utils';
import { ShareButton } from '@/app/jobs/[id]/share-button';
import { Separator } from '@/components/ui/separator';
import { TimeAgo } from '@/components/ui/time-ago';

const visaTypeTranslations: { [key: string]: string } = {
  work: 'تأشيرة عمل',
  study: 'تأشيرة دراسة',
  training: 'تأشيرة تدريب',
  volunteer: 'تأشيرة تطوع',
  job_seeker: 'تأشيرة باحث عن عمل',
  working_holiday: 'تأشيرة عطلة وعمل (Working Holiday)',
  permanent_residency: 'تأشيرة هجرة دائمة',
  family_reunification: 'تأشيرة لم الشمل',
  seasonal: 'تأشيرة موسمية',
  other: 'أخرى',
};

const InfoItem = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number | undefined; color?: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border/60 hover:border-primary/30 transition-colors h-full w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(16.666%-0.625rem)]">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
                <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0 text-right">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-sm truncate">{String(value)}</dd>
            </div>
        </div>
    );
};

const DetailSectionCard = ({ icon: Icon, title, color, children, className }: { icon: React.ElementType, title: string, color?: string, children: React.ReactNode, className?: string }) => {
    if (!children) return null;
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl" style={{color}}>
                    <Icon className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
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

interface ImmigrationDesktopDetailsProps {
    post: ImmigrationPost;
}

export function ImmigrationDesktopDetails({ post }: ImmigrationDesktopDetailsProps) {
    const programDetails = getProgramTypeDetails(post.programType);
    const sectionColor = '#0ea5e9';
    const iconName = programDetails.icon;
    const iconColor = programDetails.color;
    
    const contactButtons = [
        post.phone && { type: 'phone', href: `tel:${post.phone}`, label: 'اتصال', icon: Phone, className: 'bg-[#0D47A1] hover:bg-[#0D47A1]/90' },
        post.whatsapp && { type: 'whatsapp', href: `https://wa.me/${post.whatsapp.replace(/\+/g, '')}`, label: 'واتساب', icon: MessageSquare, className: 'bg-green-600 hover:bg-green-700' },
        post.email && { type: 'email', href: `mailto:${post.email}`, label: 'البريد الإلكتروني', icon: Mail, className: 'bg-gray-600 hover:bg-gray-700' },
        post.instagram && { type: 'instagram', href: `https://instagram.com/${post.instagram.replace(/@/g, '')}`, label: 'إنستغرام', icon: Instagram, className: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90' },
    ].filter(Boolean);

    const descriptionSection = post.description ? { id: 'description', icon: Info, title: "وصف تفصيلي", content: <FormattedText text={post.description} /> } : null;

    const allOtherSections = [
        post.availablePositions && { id: 'availablePositions', icon: Briefcase, title: "المناصب المتاحة", content: <FormattedText text={post.availablePositions} /> },
        post.requirements && { id: 'requirements', icon: ClipboardList, title: "الشروط العامة", content: <FormattedText text={post.requirements} /> },
        post.qualifications && { id: 'qualifications', icon: GraduationCap, title: "المؤهلات المطلوبة", content: <FormattedText text={post.qualifications} /> },
        post.experience && { id: 'experience', icon: Award, title: "الخبرة المطلوبة", content: <FormattedText text={post.experience} /> },
        post.tasks && { id: 'tasks', icon: CheckSquare, title: "المهام المطلوبة", content: <FormattedText text={post.tasks} /> },
        post.featuresAndOpportunities && { id: 'featuresAndOpportunities', icon: Target, title: "المميزات والفرص", content: <FormattedText text={post.featuresAndOpportunities} /> },
        ...(post.extraSections || []).map(section => ({ id: `extra-${section.id}`, icon: LayoutList, title: section.title, content: <FormattedText text={section.content} /> })),
        post.howToApply && { id: 'howToApply', icon: HelpCircle, title: "كيفية التقديم", content: <FormattedText text={post.howToApply} ordered /> }
    ].filter(Boolean) as { id: string; icon: React.ElementType; title: string; content: React.ReactNode; }[];
    

    return (
        <div className="container mx-auto max-w-5xl px-4 pb-12 space-y-6">
            <Card className="overflow-hidden shadow-lg border-2" style={{ borderColor: sectionColor }}>
                 <CardHeader className="p-6" style={{ backgroundColor: `${sectionColor}1A`}}>
                    <div className="flex items-center gap-4 mb-3">
                       <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10" style={{ backgroundColor: `${iconColor}2A` }}>
                            <CategoryIcon name={iconName} className="h-8 w-8" style={{ color: iconColor }} />
                       </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-snug">
                            {post.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-x-4 text-muted-foreground text-sm pt-2">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                                نُشرت: <TimeAgo date={post.createdAtISO || new Date().toISOString()} initialText={post.postedAt} />
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                        {post.salary && (
                            <div className="flex items-center gap-1.5 font-bold text-base" style={{ color: iconColor }}>
                                <Wallet className="h-4 w-4" />
                                <span>{post.salary}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{post.targetCountry}{post.city ? `, ${post.city}` : ''}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                     <div className="flex flex-wrap justify-center gap-3 bg-muted/30 dark:bg-muted/10 border border-border/50 rounded-xl p-4">
                        <InfoItem icon={LayoutGrid} label="نوع البرنامج" value={programDetails.label} color={iconColor} />
                        {post.visaType && <InfoItem icon={Plane} label="نوع التأشيرة" value={visaTypeTranslations[post.visaType] || post.visaType} color={iconColor} />}
                        <InfoItem icon={MapPin} label="الموقع" value={`${post.targetCountry}${post.city ? ', ' + post.city : ''}`} color={iconColor} />
                        {post.positionsAvailable && <InfoItem icon={Users} label="عدد المناصب" value={post.positionsAvailable} color={iconColor} />}
                        <InfoItem icon={Users} label="الفئة المستهدفة" value={post.targetAudience} color={iconColor} />
                         {post.salary && <InfoItem icon={Wallet} label="الأجر" value={post.salary} color={iconColor} />}
                        {post.deadline && <InfoItem icon={CalendarDays} label="آخر أجل" value={post.deadline} color={iconColor} />}
                    </div>

                    {descriptionSection && (
                        <>
                            <Separator className="my-6" />
                            <DetailSectionCard
                                icon={descriptionSection.icon}
                                title={descriptionSection.title}
                                color={sectionColor}
                                className="col-span-full"
                            >
                                {descriptionSection.content}
                            </DetailSectionCard>
                        </>
                    )}

                    {allOtherSections.length > 0 && (
                         <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {allOtherSections.map((section, index) => (
                                    <DetailSectionCard 
                                        key={section.id} 
                                        icon={section.icon} 
                                        title={section.title} 
                                        color={sectionColor}
                                        className={cn(allOtherSections.length % 2 !== 0 && index === allOtherSections.length - 1 && 'md:col-span-2')}
                                    >
                                        {section.content}
                                    </DetailSectionCard>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <LinkIcon className="h-5 w-5" style={{ color: sectionColor }}/>
                            التقديم على الفرصة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 pt-0">
                        {post.applyUrl && (
                            <Button asChild size="lg" className="text-primary-foreground font-semibold text-base py-6 active:scale-95 transition-transform" style={{backgroundColor: sectionColor}}>
                                <a href={post.applyUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-90">
                                    <LinkIcon className="ml-2 h-5 w-5" />
                                    الذهاب إلى رابط التسجيل
                                </a>
                            </Button>
                        )}
                        {contactButtons.map(button => {
                            if (!button) return null;
                            return (
                            <Button key={button.type} asChild size="lg" className={cn("text-primary-foreground font-semibold text-base py-6 active:scale-95 transition-transform", button.className)}>
                                <a href={button.href} target={button.type !== 'phone' ? '_blank' : undefined} rel="noopener noreferrer">
                                    <button.icon className="ml-2 h-5 w-5" />
                                    {button.label}
                                </a>
                            </Button>
                        )})}
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
                        <SaveAdButton adId={post.id} adType="immigration" />
                        <ShareButton title={post.title || ''} text={post.description || ''} />
                    </CardContent>
                </Card>
            </div>
            
            <div className="text-center">
                <ReportAdDialog adId={post.id} />
            </div>
        </div>
    );
}
