
'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { addTestimonial, updateTestimonial } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { revalidateAll } from '@/lib/revalidate';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/turnstile-widget';
import { verifyTurnstileToken } from '@/lib/verify-turnstile-client';
import type { Testimonial } from '@/lib/types';

const formSchema = z.object({
  rating: z.number().min(1, { message: 'الرجاء اختيار تقييم.' }).max(5),
  content: z.string().min(10, { message: 'يجب أن يكون الرأي 10 أحرف على الأقل.' }).max(500, { message: 'يجب ألا يتجاوز الرأي 500 حرف.' }),
});

interface AddTestimonialFormProps {
  existingTestimonial?: Testimonial | null;
}

export function AddTestimonialForm({ existingTestimonial }: AddTestimonialFormProps) {
  const isEditing = !!existingTestimonial;
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: existingTestimonial?.rating ?? 0,
      content: existingTestimonial?.content ?? '',
    },
  });

  const ratingValue = form.watch('rating');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userData) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب عليك تسجيل الدخول أولاً.",
      });
      router.push('/login');
      return;
    }

    if (!turnstileToken) {
      toast({
        variant: "destructive",
        title: "التحقق الأمني غير مكتمل",
        description: "يرجى الانتظار قليلاً حتى يكتمل التحقق ثم إعادة المحاولة.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const isVerifiedHuman = await verifyTurnstileToken(turnstileToken);
      if (!isVerifiedHuman) {
        toast({
          variant: "destructive",
          title: "فشل التحقق الأمني",
          description: "تعذر التحقق من أنك لست روبوتًا. يرجى إعادة المحاولة.",
        });
        return;
      }

      if (isEditing && existingTestimonial) {
        await updateTestimonial(existingTestimonial.id, {
          content: values.content,
          rating: values.rating,
        });

        await revalidateAll();

        toast({
          title: "تم تحديث رأيك بنجاح!",
          description: "شكرًا لتحديث رأيك، نقدّر مشاركتك المستمرة معنا.",
        });
      } else {
        await addTestimonial({
          userId: user.uid,
          userName: userData.name,
          userAvatarColor: userData.avatarColor || '#3b82f6',
          content: values.content,
          rating: values.rating,
        });

        await revalidateAll();

        toast({
          title: "شكرًا لك!",
          description: "تم إرسال رأيك بنجاح. نحن نقدر مساهمتك.",
        });
      }
      router.push(isEditing ? '/profile/my-testimonial' : '/testimonials');
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_TESTIMONIAL') {
        toast({
          variant: "destructive",
          title: "لديك رأي منشور بالفعل",
          description: "يبدو أنك نشرت رأياً سابقاً. أعد تحميل الصفحة لتتمكن من تعديله.",
        });
      } else {
        console.error("Failed to save testimonial:", error);
        toast({
          variant: "destructive",
          title: "خطأ في الإرسال",
          description: "حدث خطأ غير متوقع أثناء إرسال رأيك. يرجى المحاولة مرة أخرى لاحقًا.",
        });
      }
    } finally {
      setIsSubmitting(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-center gap-2 text-base md:text-lg"><Star className="h-4 w-4" /> تقييمك للمنصة</FormLabel>
              <FormControl>
                 <div 
                    className="flex flex-row-reverse justify-center items-center gap-2" 
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-8 w-8 cursor-pointer transition-colors",
                          (hoveredRating >= star || ratingValue >= star) 
                            ? "text-yellow-500 fill-yellow-400"
                            : "text-muted-foreground/50"
                        )}
                        onClick={() => form.setValue('rating', star, { shouldValidate: true })}
                        onMouseEnter={() => setHoveredRating(star)}
                      />
                    ))}
                  </div>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base md:text-lg"><MessageSquare className="h-4 w-4" /> رأيك يهمنا</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="اكتب هنا رأيك حول تجربتك مع منصة توظيفك..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <TurnstileWidget
            ref={turnstileRef}
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full active:scale-95 transition-transform" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'حفظ التعديلات' : 'إرسال الرأي'}
        </Button>
      </form>
    </Form>
  );
}
