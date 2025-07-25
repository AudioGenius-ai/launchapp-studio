import React, { forwardRef } from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>((props, ref) => (
  <AspectRatioPrimitive.Root ref={ref} {...props} />
));
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName;

export { AspectRatio };