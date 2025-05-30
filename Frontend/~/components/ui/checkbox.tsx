import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as React from 'react';
import { Platform } from 'react-native';
import { Check } from '~/lib/icons/Check';
import { cn } from '~/lib/utils';
function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.RootProps & {
  ref?: React.RefObject<CheckboxPrimitive.RootRef>;
}) {
  const isChecked = props.checked;

  return (
    <CheckboxPrimitive.Root
      className={cn(
        'web:peer h-4 w-4 native:h-[20] native:w-[20] shrink-0 rounded-sm native:rounded border transition-colors duration-200',
        isChecked
          ? 'border-primary bg-primary'
          : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-black', // ← use visible background
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center h-full w-full">
        <Check
          size={Platform.OS === 'web' ? 12 : 16}
          strokeWidth={Platform.OS === 'web' ? 2.5 : 3.5}
          className="text-primary-foreground"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}


export { Checkbox };