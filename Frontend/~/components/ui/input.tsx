import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from '~/lib/utils';

function Input({
  className,
  placeholderClassName, // You can optionally remove this if it's not used on web
  style,
  placeholderTextColor = '#6B7280', // default gray-500 from Tailwind (text-foreground)
  ...props
}: TextInputProps & {
  ref?: React.RefObject<TextInput>;
  style?: any;
}) {
  return (
    <TextInput
      className={cn(
        'web:flex h-12 native:min-h-[48px] web:w-full rounded-md border border-input bg-background px-3 py-5 text-base lg:text-sm native:text-lg native:leading-[24px] text-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        props.editable === false && 'opacity-50 web:cursor-not-allowed',
        className
      )}
      placeholderTextColor={placeholderTextColor}
      style={style}
      {...props}
    />
  );
}

export { Input };
