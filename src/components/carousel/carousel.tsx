"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  carouselItemClassName?: string;
  id?: string;
  className?: string;
  gap?: string;
  padding?: string;
  itemSizing?: {
    base: string;
    sm?: string;
    lg?: string;
  };
  showControls?: boolean;
  showScrollbar?: boolean;
  showPagination?: boolean;
  paginationDotClassName?: string;
  paginationClassName?: string;
  controlsPosition?: "top" | "bottom";
  scrollAmount?: number;
  autoplay?: {
    enabled: boolean;
    delay?: number;
    stopOnInteraction?: boolean;
  };
  loop?: boolean;
  useScrollSnap?: boolean;
  onSlideChange?: (index: number) => void;
}

const Carousel = <T,>({
  items,
  renderItem,
  carouselItemClassName,
  id = "carousel",
  className,
  gap = "gap-[14px]",
  padding = "px-5 md:px-10",
  itemSizing = {
    base: "w-[calc(91.666667%-7px)]",
    sm: "sm:w-[calc(50%-7px)]",
    lg: "lg:w-[calc(33.333333%-9.33px)]",
  },
  showControls = true,
  showScrollbar = true,
  showPagination = false,
  paginationDotClassName = "bg-gray-300",
  paginationClassName,
  controlsPosition = "top",
  scrollAmount = 0.5,
  autoplay,
  loop = false,
  useScrollSnap = false,
  onSlideChange,
}: CarouselProps<T>) => {
  const filteredItems = items?.filter((item) => item !== null && item !== undefined) || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateScrollState = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    setCanScroll(scrollWidth > clientWidth);
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1);
    setScrollProgress(
      scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0
    );

    // Update current index for pagination
    if (useScrollSnap) {
      const itemWidth = clientWidth / filteredItems.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
      if (onSlideChange && newIndex !== currentIndex) {
        onSlideChange(newIndex);
      }
    }
  }, [useScrollSnap, filteredItems.length, currentIndex, onSlideChange]);

  const getItemWidth = useCallback(() => {
    if (!containerRef.current) return 0;
    const itemElement = containerRef.current.querySelector(`#${id}-item-0`);
    return itemElement ? itemElement.clientWidth : 0;
  }, [id]);

  const scrollTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    if (!containerRef.current) return;
    const itemWidth = getItemWidth();
    const gapValue = parseInt(gap.replace('gap-', '')) || 0;
    const scrollLeft = index * (itemWidth + gapValue);
    containerRef.current.scrollTo({
      left: scrollLeft,
      behavior,
    });
    setCurrentIndex(index);
  }, [gap, getItemWidth]);

  const scrollNext = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollWidth, clientWidth } = containerRef.current;
    const itemWidth = getItemWidth();
    const gapValue = parseInt(gap.replace('gap-', '')) || 0;

    let nextIndex = currentIndex + 1;
    const nextScrollLeft = nextIndex * (itemWidth + gapValue);

    if (nextScrollLeft >= scrollWidth - clientWidth + gapValue) {
      if (loop) {
        nextIndex = 0;
      } else {
        return; // Stop if not looping and at the end
      }
    }
    scrollTo(nextIndex);
  }, [currentIndex, loop, gap, scrollTo, getItemWidth]);


  const startAutoplay = useCallback(() => {
    if (autoplay?.enabled && autoplay.delay && !isHovered && !isDragging) {
      stopAutoplay(); // Clear any existing interval
      intervalRef.current = setInterval(() => {
        scrollNext();
      }, autoplay.delay);
    }
  }, [autoplay, isHovered, isDragging, scrollNext]);

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const scrollToPrev = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmountPx = container.clientWidth * scrollAmount;
    container.scrollBy({ left: -scrollAmountPx, behavior: "smooth" });
  };

  const scrollToNext = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmountPx = container.clientWidth * scrollAmount;
    container.scrollBy({ left: scrollAmountPx, behavior: "smooth" });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  // Autoplay effect
  useEffect(() => {
    if (autoplay?.enabled) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [autoplay?.enabled, startAutoplay]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (autoplay?.stopOnInteraction) {
      stopAutoplay();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startAutoplay();
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const scrollToProgress = (progress: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    container.scrollTo({ left: progress * maxScroll, behavior: "smooth" });
  };

  const itemSizeClasses = [
    itemSizing.base,
    itemSizing.sm,
    itemSizing.lg,
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={cn("relative w-full", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-x-auto scroll-smooth",
          gap,
          padding,
          useScrollSnap && "snap-x snap-mandatory",
          // Hide native scrollbar - we'll use custom one
          "scrollbar-none",
          // Custom scrollbar styles for webkit browsers
          "[&::-webkit-scrollbar]:hidden"
        )}
        style={{
          // Ensure smooth scrolling on all browsers
          scrollBehavior: useScrollSnap ? "smooth" : "auto",
        }}
      >
        {filteredItems.map((item, index) => (
          <div
            key={index}
            id={`${id}-item-${index}`}
            className={cn(
              "flex-none",
              itemSizeClasses,
              carouselItemClassName
            )}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Controls */}
      {canScroll && showControls && (
        <div className={cn(
          "absolute flex gap-4 justify-end items-center",
          padding,
          controlsPosition === "top" ? "-top-[32px] right-0" : "bottom-4 right-0"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full hidden md:flex items-center justify-center"
            disabled={!canScrollPrev}
            onClick={scrollToPrev}
          >
            <Icon.chevronLeft
              className={cn(
                "h-5 w-5 stroke-2",
                !canScrollPrev && "stroke-[#DCDCDC]"
              )}
            />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hidden md:flex items-center justify-center"
            disabled={!canScrollNext}
            onClick={scrollToNext}
          >
            <Icon.chevronRight
              className={cn(
                "h-5 w-5 stroke-2",
                !canScrollNext && "stroke-[#DCDCDC]"
              )}
            />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      )}

      {/* Scrollbar */}
      {canScroll && showScrollbar && (
        <div className={cn("mt-4 md:mt-6", padding)}>
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={scrollProgress}
              onChange={(e) => scrollToProgress(parseFloat(e.target.value))}
              aria-label="Carousel scroll"
              style={{ ["--thumb-w" as string]: "25%" }}
              className={cn(
                // Basic styling for a subtle, thin slider matching original
                "w-full h-1 cursor-pointer appearance-none bg-transparent",
                // Track — width: full, height: 1px, border: 1px solid rgba(220,220,220,1)
                "[&::-webkit-slider-runnable-track]:h-[1px] [&::-webkit-slider-runnable-track]:bg-transparent",
                "[&::-webkit-slider-runnable-track]:border [&::-webkit-slider-runnable-track]:border-[rgba(220,220,220,1)]",
                "[&::-moz-range-track]:h-[1px] [&::-moz-range-track]:bg-transparent",
                "[&::-moz-range-track]:border [&::-moz-range-track]:border-[rgba(220,220,220,1)]",
                // Thumb — width = 25%, height = 1px, border = 1px solid rgba(42,42,42,1)
                "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[1px] [&::-webkit-slider-thumb]:w-[var(--thumb-w)]",
                "[&::-webkit-slider-thumb]:-mt-[1px] [&::-webkit-slider-thumb]:rounded-none",
                "[&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[rgba(42,42,42,1)]",
                "[&::-webkit-slider-thumb]:shadow-none [&::-webkit-slider-thumb]:outline-none",
                "[&::-moz-range-thumb]:h-[1px] [&::-moz-range-thumb]:w-[var(--thumb-w)] [&::-moz-range-thumb]:rounded-none",
                "[&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[rgba(42,42,42,1)]",
                "[&::-moz-range-thumb]:shadow-none [&::-moz-range-thumb]:outline-none"
              )}
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className={cn("flex justify-center mt-4", paginationClassName)}>
          {filteredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 mx-1 rounded-full",
                paginationDotClassName,
                currentIndex === index && "bg-blue-500"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { Carousel };
