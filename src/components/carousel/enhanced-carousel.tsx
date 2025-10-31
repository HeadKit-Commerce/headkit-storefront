"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

interface EnhancedCarouselProps<T> {
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
  paginationStyle?: React.CSSProperties;
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
  initialSelectedIndex?: number;
}

const EnhancedCarousel = <T,>({
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
  paginationDotClassName = "bg-white",
  paginationClassName = "absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-wrap justify-center gap-2",
  paginationStyle,
  controlsPosition = "top",
  scrollAmount = 0.5,
  autoplay,
  loop = false,
  useScrollSnap = false,
  onSlideChange,
  initialSelectedIndex = 0,
}: EnhancedCarouselProps<T>) => {
  const filteredItems = items?.filter((item) => item !== null && item !== undefined) || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Calculate current slide based on scroll position
  const updateScrollState = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // For full-width carousels, each slide is exactly the container width
    // For other carousels, use the scrollAmount multiplier
    const isFullWidth = itemSizing.base === "w-full";
    const itemWidth = isFullWidth ? clientWidth : clientWidth * scrollAmount * 2;

    setCanScroll(scrollWidth > clientWidth);
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1);
    setScrollProgress(
      scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0
    );

    // Calculate current slide
    if (itemWidth > 0) {
      const newSlide = Math.round(scrollLeft / itemWidth);
      if (newSlide !== currentSlide) {
        setCurrentSlide(newSlide);
        onSlideChange?.(newSlide);
      }
    }
  }, [currentSlide, onSlideChange, scrollAmount, itemSizing.base]);

  const scrollToPrev = () => {
    if (!containerRef.current) return;
    setUserInteracted(true);
    const container = containerRef.current;
    
    // For full-width carousels (like main carousel), scroll by full container width
    // For other carousels, use the scrollAmount multiplier
    const isFullWidth = itemSizing.base === "w-full";
    const scrollAmountPx = isFullWidth 
      ? container.clientWidth 
      : container.clientWidth * scrollAmount;
    
    container.scrollBy({ left: -scrollAmountPx, behavior: "smooth" });
  };

  const scrollToNext = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // For full-width carousels (like main carousel), scroll by full container width
    // For other carousels, use the scrollAmount multiplier
    const isFullWidth = itemSizing.base === "w-full";
    const scrollAmountPx = isFullWidth 
      ? container.clientWidth 
      : container.clientWidth * scrollAmount;
    
    // Handle looping
    if (loop && !canScrollNext) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmountPx, behavior: "smooth" });
    }
  }, [scrollAmount, loop, canScrollNext, itemSizing.base]);

  // Intersection Observer for autoplay optimization
  useEffect(() => {
    if (!autoplay?.enabled) return;

    const currentCarousel = containerRef.current;
    if (!currentCarousel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(currentCarousel);

    return () => {
      observer.disconnect();
    };
  }, [autoplay?.enabled]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay?.enabled || !isVisible || (autoplay.stopOnInteraction && userInteracted)) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }

    const delay = autoplay.delay || 5000;
    autoplayRef.current = setInterval(() => {
      scrollToNext();
    }, delay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [autoplay, isVisible, userInteracted, scrollToNext]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  // Scroll to initial selected index on mount
  useEffect(() => {
    if (initialSelectedIndex > 0 && containerRef.current) {
      const container = containerRef.current;
      const isFullWidth = itemSizing.base === "w-full";
      const slideWidth = isFullWidth 
        ? container.clientWidth 
        : container.clientWidth * scrollAmount * 2;
      
      container.scrollTo({ left: initialSelectedIndex * slideWidth, behavior: "auto" });
    }
  }, [initialSelectedIndex, itemSizing.base, scrollAmount]);

  const scrollToProgress = (progress: number) => {
    if (!containerRef.current) return;
    setUserInteracted(true);
    const container = containerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    container.scrollTo({ left: progress * maxScroll, behavior: "smooth" });
  };

  const scrollToSlide = (slideIndex: number) => {
    if (!containerRef.current) return;
    setUserInteracted(true);
    const container = containerRef.current;
    
    // For full-width carousels, each slide is exactly the container width
    // For other carousels, use the scrollAmount multiplier
    const isFullWidth = itemSizing.base === "w-full";
    const slideWidth = isFullWidth 
      ? container.clientWidth 
      : container.clientWidth * scrollAmount * 2;
    
    container.scrollTo({ left: slideIndex * slideWidth, behavior: "smooth" });
  };

  const itemSizeClasses = [
    itemSizing.base,
    itemSizing.sm,
    itemSizing.lg,
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-x-auto scroll-smooth",
          gap,
          padding,
          // Hide native scrollbar - we'll use custom one
          "scrollbar-none",
          // Custom scrollbar styles for webkit browsers
          "[&::-webkit-scrollbar]:hidden",
          // Scroll snap styles
          useScrollSnap && "snap-x snap-mandatory"
        )}
        style={{
          // Ensure smooth scrolling on all browsers
          scrollBehavior: "smooth",
        }}
      >
        {filteredItems.map((item, index) => (
          <div
            key={index}
            id={`${id}-item-${index}`}
            className={cn(
              "flex-none",
              itemSizeClasses,
              carouselItemClassName,
              // Add scroll snap alignment when enabled
              useScrollSnap && "snap-start"
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
            <Icon.arrowLeft
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
            disabled={!canScrollNext && !loop}
            onClick={scrollToNext}
          >
            <Icon.arrowRight
              className={cn(
                "h-5 w-5 stroke-2",
                (!canScrollNext && !loop) && "stroke-[#DCDCDC]"
              )}
            />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      )}

      {/* Pagination Dots */}
      {showPagination && filteredItems.length > 1 && (
        <div className={paginationClassName} style={paginationStyle}>
          {filteredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              name={`go-to-slide-${index + 1}`}
              title={`Go to slide ${index + 1}`}
              className={cn(
                "w-[10px] h-[10px] opacity-50 rounded-full inline-block cursor-pointer",
                paginationDotClassName,
                currentSlide === index && "opacity-100"
              )}
            />
          ))}
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
    </div>
  );
};

export { EnhancedCarousel };
