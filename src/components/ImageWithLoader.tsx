import { useState, useEffect } from 'react'

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    className?: string
    imageClassName?: string
    priority?: boolean
}

export function ImageWithLoader({ src, alt, className = '', imageClassName = '', priority = false, ...props }: ImageWithLoaderProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [currentSrc, setCurrentSrc] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)
        const img = new Image()
        img.src = src
        img.onload = () => {
            setCurrentSrc(src)
            setIsLoading(false)
        }
    }, [src])

    return (
        <div className={`relative ${className}`}>
            {/* Loading Placeholder / Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-comic-red border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <img
                src={currentSrc || src} // Fallback to src if currentSrc isn't set yet (though opacity handles visibility)
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                className={`transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'} ${imageClassName}`}
                {...props}
            />
        </div>
    )
}
