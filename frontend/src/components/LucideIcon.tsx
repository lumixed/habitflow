'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface LucideIconProps extends LucideProps {
    name: string;
}

const LucideIcon = ({ name, ...props }: LucideIconProps) => {
    // Dynamically get the icon component
    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
        // Fallback or log error if icon not found
        console.warn(`Icon "${name}" not found in lucide-react`);
        return <LucideIcons.HelpCircle {...props} />;
    }

    return <IconComponent {...props} />;
};

export default LucideIcon;
