'use client';

import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { PlusCircle, Trash2, Link as LinkIcon } from 'lucide-react';

interface ExtraLinksFieldProps {
  // "any" مقصود هنا لنفس سبب استخدامه في ExtraSectionsField: هذا المكوّن
  // مشترك بين عدة نماذج (post-job / post-competition / edit-competition /
  // post-immigration / edit-immigration) ولكل واحد منها نوع "Control" مختلف.
  control: any;
  name?: string;
  themeColor?: string;
}

const generateLinkId = () =>
  `link_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function ExtraLinksField({ control, name = 'extraLinks', themeColor }: ExtraLinksFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold">
        <LinkIcon className="h-4 w-4" style={{ color: themeColor }} />
        روابط إضافية (اختياري)
      </h3>
      <p className="text-sm text-muted-foreground -mt-2">
        إذا كان لديك أكثر من رابط للتقديم أو التسجيل، أضفه هنا مع عنوان خاص به، وسيظهر هذا العنوان في صفحة التفاصيل.
      </p>

      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-muted-foreground">رابط {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="ml-1 h-3 w-3" />
              حذف الرابط
            </Button>
          </div>
          <FormField
            control={control}
            name={`${name}.${index}.id`}
            render={({ field }) => (
              <input type="hidden" {...field} />
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="عنوان الرابط (مثال: التسجيل عبر منصة كذا)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.url`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="url" placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append({ id: generateLinkId(), title: '', url: '' })}
      >
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة رابط
      </Button>
    </div>
  );
}
