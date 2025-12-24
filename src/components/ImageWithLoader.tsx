import { useState, useEffect } from 'react'

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    thumbnailSrc?: string
    alt: string
    className?: string
    imageClassName?: string
    priority?: boolean
}

export function ImageWithLoader({ src, thumbnailSrc, alt, className = '', imageClassName = '', priority = false, ...props }: ImageWithLoaderProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [currentSrc, setCurrentSrc] = useState<string | null>(null)

    useEffect(() => {
        // If we have a different src, reset loading state
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
            {/* Loading Spinner (only if no thumbnail) */}
            {isLoading && !thumbnailSrc && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-comic-red border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Thumbnail (Blur Up) layer */}
            {thumbnailSrc && (
                <img
                    src={thumbnailSrc}
                    alt={alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoading ? 'opacity-100 blur-sm' : 'opacity-0'} ${imageClassName}`}
                    {...props}
                />
            )}

            {/* High Res Image */}
            <img
                src={currentSrc || (thumbnailSrc ? '' : src)}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                className={`transform transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'} ${imageClassName}`}
                {...props}
            />
        </div>
    )
}
