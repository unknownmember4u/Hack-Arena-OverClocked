import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, PlusIcon } from 'lucide-react';

type ContactInfoProps = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  label: string;
  value: string;
};

type ContactCardProps = React.ComponentProps<'div'> & {
  title?: string;
  description?: string;
  contactInfo?: ContactInfoProps[];
  formSectionClassName?: string;
};

export function ContactCard({
  title = 'Contact With Us',
  description = 'If you have any questions regarding our Services or need help, please fill out the form here.',
  contactInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        'bg-white/40 backdrop-blur-xl border border-white/60 relative grid h-full w-full shadow-2xl shadow-black/[0.03] md:grid-cols-2 lg:grid-cols-3 rounded-[2rem]',
        className,
      )}
      {...props}
    >
      <PlusIcon className="absolute -top-3 -left-3 h-6 w-6 text-black/10" />
      <PlusIcon className="absolute -top-3 -right-3 h-6 w-6 text-black/10" />
      <PlusIcon className="absolute -bottom-3 -left-3 h-6 w-6 text-black/10" />
      <PlusIcon className="absolute -right-3 -bottom-3 h-6 w-6 text-black/10" />
      <div className="flex flex-col justify-between lg:col-span-2">
        <div className="relative h-full space-y-4 px-4 py-8 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-[#1a1a1a] tracking-tight">
            {title}
          </h1>
          <p className="text-black/50 max-w-xl text-sm md:text-base lg:text-lg leading-relaxed">
            {description}
          </p>
          <div className="grid gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
            {contactInfo?.map((info, index) => (
              <ContactInfo key={index} {...info} />
            ))}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'bg-white/30 backdrop-blur-md flex h-full w-full items-center border-t md:col-span-1 md:border-t-0 md:border-l border-black/5 p-5 rounded-r-[2rem]',
          formSectionClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: ContactInfoProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)} {...props}>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/80 shadow-sm">
        <Icon className="h-5 w-5 text-[#1a1a1a]" />
      </div>
      <div>
        <p className="font-semibold text-[#1a1a1a]">{label}</p>
        <p className="text-black/40 text-xs">{value}</p>
      </div>
    </div>
  );
}
