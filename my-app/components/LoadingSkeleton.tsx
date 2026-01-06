export default function LoadingSkeleton() {
    return (
        <div className="grid-auto-cards">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                    {/* Image Skeleton */}
                    <div className="h-48 w-full skeleton"></div>

                    {/* Content Skeleton */}
                    <div className="p-5 space-y-3">
                        {/* Name */}
                        <div className="h-6 skeleton rounded w-3/4"></div>

                        {/* Vehicle Number */}
                        <div className="h-8 skeleton rounded-full w-2/3"></div>

                        {/* Area */}
                        <div className="h-4 skeleton rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
