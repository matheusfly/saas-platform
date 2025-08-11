
import React from 'react';

export const SkeletonDivRow: React.FC = () => (
    <div className="flex items-center border-b border-border p-4 animate-pulse h-[76px]">
        <div className="flex items-center w-[35%]">
            <div className="w-10 h-10 rounded-full mr-4 bg-ui-sidebar-surface flex-shrink-0"></div>
            <div className="w-full">
                <div className="h-4 bg-ui-sidebar-surface rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-ui-sidebar-surface rounded w-full"></div>
            </div>
        </div>
        <div className="w-[15%] px-4">
             <div className="h-6 bg-ui-sidebar-surface rounded w-20"></div>
        </div>
        <div className="w-[20%] px-4">
             <div className="h-4 bg-ui-sidebar-surface rounded w-24"></div>
        </div>
        <div className="w-[15%] px-4">
             <div className="h-4 bg-ui-sidebar-surface rounded w-28"></div>
        </div>
         <div className="w-[15%] px-4">
             <div className="h-10 bg-ui-sidebar-surface rounded-lg w-36"></div>
        </div>
    </div>
);


export const SkeletonDivTable: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
    return (
        <div className="w-full">
            {Array.from({ length: rows }).map((_, index) => (
                <SkeletonDivRow key={index} />
            ))}
        </div>
    );
};


export const SkeletonKpiCard: React.FC = () => (
    <div className="bg-ui-surface p-6 rounded-2xl shadow-lg animate-pulse border border-border">
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <div className="h-4 bg-ui-sidebar-surface rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-ui-sidebar-surface rounded w-1/2"></div>
            </div>
            <div className="bg-ui-sidebar-surface p-3 rounded-full w-12 h-12"></div>
        </div>
        <div className="mt-4 flex items-center">
            <div className="h-4 bg-ui-sidebar-surface rounded w-full"></div>
        </div>
    </div>
);

export const SkeletonChart: React.FC = () => (
     <div className="bg-ui-surface p-6 rounded-2xl shadow-lg animate-pulse border border-border">
        <div className="flex items-center mb-4">
            <div className="bg-ui-sidebar-surface p-2 rounded-lg mr-3 w-10 h-10"></div>
            <div className="h-6 bg-ui-sidebar-surface rounded w-40"></div>
        </div>
        <div className="space-y-4 mt-2">
            <div className="h-10 bg-ui-sidebar-surface rounded-lg w-full"></div>
            <div className="h-10 bg-ui-sidebar-surface rounded-lg w-full"></div>
            <div className="h-10 bg-ui-sidebar-surface rounded-lg w-full"></div>
            <div className="h-10 bg-ui-sidebar-surface rounded-lg w-full"></div>
        </div>
    </div>
);
