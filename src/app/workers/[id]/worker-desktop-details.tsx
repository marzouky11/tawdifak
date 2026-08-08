
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone, MessageSquare, MapPin, CalendarDays, Clock,
  Instagram, GraduationCap, Mail, LayoutGrid, FileText, Bookmark, FileSignature, CheckCircle2
} from 'lucide-react';
import type { Job, WorkType } from '@/lib/types';
import { ShareButton } from '@/app/jobs/[id]/share-button';
import { ReportAdDialog } from '@/app/jobs/[id]/report-ad-dialog';
import { SaveAdButton } from '@/app/jobs/[id]/save-ad-button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';

const workTypeTranslations: { [key in WorkType]: string } = {
  full_time: 'دوام كامل',
  part_time: 'دوام جزئي',
  remote: 'عن بعد',
  hybrid: 'هجين',
  flexible: 'مرن',
};

const contractTypeTranslations: { [key: string]: string } = {
  permanent: 'دائم (CDI)',
  fixed_term: 'محدد المدة (CDD)',
  temporary: 'مؤقت',
  internship: 'تدريب (Stage)',
  seasonal: 'عقد موسمي',
  apprenticeship: 'عقد بالتناوب (Alternance)',
  anapec: 'عقد ANAPEC',
  project: 'عقد مشروع',
  other: 'أخرى',
};

// A clean CV-style "label / value" row, instead of the colorful ad-style tiles
// used on job/immigration/competition detail pages.
const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(20%-0.8rem)]">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-semibold text-sm text-foreground break-words">{String(value)}</dd>
      </div>
    </div>
  );
};

const FormattedText = ({ text }: { text?: string }) => {
  if (!text || text.trim() === '') return <p className="italic text-muted-foreground">غير محدد</p>;

  const contentBlocks = text.split('\n').filter(line => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-outside ms-6 my-4 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  contentBlocks.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.replace(/^[-*]\s*/, ''));
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

interface WorkerDesktopDetailsProps {
    job: Job;
}

export function WorkerDesktopDetails({ job }: WorkerDesktopDetailsProps) {
    const categoryName = job.categoryName;
    const translatedWorkType = job.workType ? workTypeTranslations[job.workType] : undefined;
    const translatedContractType = job.contractType ? contractTypeTranslations[job.contractType] : undefined;
    const accentColor = '#424242';

    const contactButtons = [
        job.phone && { type: 'phone', href: `tel:${job.phone}`, label: 'اتصال', icon: Phone, className: 'bg-slate-700 hover:bg-slate-800' },
        job.whatsapp && { type: 'whatsapp', href: `https://wa.me/${job.whatsapp.replace(/\+/g, '')}`, label: 'واتساب', icon: MessageSquare, className: 'bg-green-600 hover:bg-green-700' },
        job.email && { type: 'email', href: `mailto:${job.email}`, label: 'البريد الإلكتروني', icon: Mail, className: 'bg-gray-600 hover:bg-gray-700' },
        job.instagram && { type: 'instagram', href: `https://instagram.com/${job.instagram.replace(/@/g, '')}`, label: 'إنستغرام', icon: Instagram, className: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90' },
    ].filter(Boolean);

    return (
        <div className="container mx-auto max-w-5xl px-4 pb-12">
            <div className="space-y-6">

                {/* Profile card */}
                <Card className="overflow-hidden shadow-lg">
                    <div className="h-16" style={{ backgroundColor: accentColor }} />
                    <CardContent className="pt-0 text-center -mt-10">
                        <UserAvatar
                            name={job.ownerName}
                            color={job.ownerAvatarColor}
                            photoURL={job.ownerPhotoURL}
                            className="h-20 w-20 text-3xl mx-auto ring-4 ring-background"
                        />
                        <h1 className="mt-3 text-xl font-bold text-foreground break-words">
                            {job.ownerName}
                        </h1>
                        {job.title && (
                            <p className="text-sm text-muted-foreground mt-1 break-words">{job.title}</p>
                        )}
                        <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 border-0 gap-1.5 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            متاح للعمل الآن
                        </Badge>

                        <Separator className="my-5" />

                        <dl className="flex flex-wrap justify-center gap-x-4 text-right divide-x divide-border/70 dark:divide-border/40">
                            <InfoRow icon={MapPin} label="الموقع" value={`${job.country}, ${job.city}`} />
                            {categoryName && <InfoRow icon={LayoutGrid} label="مجال العمل" value={categoryName} />}
                            {translatedWorkType && <InfoRow icon={Clock} label="نوع الدوام المفضل" value={translatedWorkType} />}
                            {translatedContractType && <InfoRow icon={FileSignature} label="نوع العقد المفضل" value={translatedContractType} />}
                            <InfoRow icon={CalendarDays} label="تاريخ النشر" value={job.postedAt} />
                        </dl>
                    </CardContent>
                </Card>

                {/* Description + Qualifications side by side */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-full w-1" style={{ backgroundColor: accentColor }} />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <FileText className="h-5 w-5" style={{ color: accentColor }} />
                                <span className="text-foreground">وصف المهارات والخبرة</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormattedText text={job.description} />
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-full w-1" style={{ backgroundColor: accentColor }} />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <GraduationCap className="h-5 w-5" style={{ color: accentColor }} />
                                <span className="text-foreground">الشهادات والمؤهلات</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormattedText text={job.qualifications} />
                        </CardContent>
                    </Card>
                </div>

                {/* Contact + Save side by side */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Phone className="h-5 w-5" style={{ color: accentColor }} />
                                <span className="text-foreground">تواصل مع الباحث عن عمل</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 grid grid-cols-1 gap-3">
                            {contactButtons.map(button => {
                                if (!button) return null;
                                return (
                                    <Button
                                        key={button.type}
                                        asChild
                                        size="lg"
                                        className={cn("h-auto py-3 text-primary-foreground font-semibold text-base active:scale-95 transition-transform", button.className)}
                                    >
                                        <a href={button.href} target={button.type !== 'phone' ? '_blank' : undefined} rel="noopener noreferrer">
                                            <button.icon className="ml-2 h-5 w-5" />
                                            {button.label}
                                        </a>
                                    </Button>
                                )
                            })}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Bookmark className="h-5 w-5" style={{ color: accentColor }} />
                                <span className="text-foreground">احفظ الإعلان وشارك مع الآخرين</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 pt-0">
                            <SaveAdButton adId={job.id} adType="job" />
                            <ShareButton title={job.title || ''} text={job.description || ''} />
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <ReportAdDialog adId={job.id} />
                </div>
            </div>
        </div>
    );
}
