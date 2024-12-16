import Skeleton from "react-loading-skeleton";

export const MainCarouselSkeleton = () => {
  return (
    <div className="relative !h-[350px] w-full md:!h-[400px] lg:!h-[700px] bg-silver-4">
      <div className="relative container mx-auto h-full">
        <div className="absolute bottom-[50px] lg:bottom-[200px] z-10 pl-4 w-full">
          <div className="w-2/3 lg:w-1/3">
            <Skeleton className="h-10 !w-2/3 mb-2 shadow-md" />
            <Skeleton className="h-10 mb-6 shadow-md" />
            <Skeleton className="h-6 w-full shadow-md" />
            <Skeleton className="h-6 w-full shadow-md" />
            <Skeleton className="h-10 !w-[160px] mt-6 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
