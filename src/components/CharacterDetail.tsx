import type { Character } from './CharacterCard'

interface CharacterDetailProps {
    character: Character
    onBack: () => void
}

export function CharacterDetail({ character, onBack }: CharacterDetailProps) {
    return (
        <div className="flex flex-col md:flex-row h-full w-full max-w-7xl mx-auto overflow-hidden bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative">
            {/* "TOP SECRET" Stamp */}
            <div className="absolute top-4 right-4 z-20 border-4 border-red-600 text-red-600 px-4 py-2 font-black text-2xl uppercase opacity-80 -rotate-12 pointer-events-none">
                Top Secret
            </div>

            {/* Left Column: Image */}
            <div className="w-full md:w-1/2 relative border-b-8 md:border-b-0 md:border-r-8 border-black">
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-comic-blue text-white font-comic text-xl uppercase border-4 border-black hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        ← Back
                    </button>
                </div>
                <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-full object-cover contrast-125"
                />
                {/* Halftone Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/comic-dots.png')] opacity-30 pointer-events-none mix-blend-multiply" />
            </div>

            {/* Right Column: Stats & Info */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-comic-yellow bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <h2 className="text-5xl md:text-7xl font-comic text-black mb-4 drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] uppercase tracking-wider -skew-x-6">
                    {character.name}
                </h2>

                <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                    <h3 className="text-xl font-comic text-comic-red mb-2 uppercase">Hero Bio:</h3>
                    <p className="text-black font-reading text-xl leading-relaxed font-bold">
                        {character.description}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <h3 className="text-3xl font-comic text-black uppercase mb-2">Power Levels</h3>
                    {Object.entries(character.stats).map(([statName, statValue]) => (
                        <div
                            key={statName}
                            className="flex items-center gap-4"
                        >
                            <div className="w-32 text-right">
                                <span className="text-black font-comic text-xl uppercase tracking-wider bg-white px-2 border-2 border-black inline-block transform -skew-x-12">
                                    {statName}
                                </span>
                            </div>

                            {/* Stat Bar */}
                            <div className="flex-1 h-6 bg-white border-4 border-black relative skew-x-12">
                                <div
                                    className="h-full bg-comic-red transition-all duration-1000 ease-out border-r-4 border-black"
                                    style={{ width: `${Math.min(statValue, 100)}%` }}
                                />
                                {/* Striped pattern overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:10px_10px]" />
                            </div>
                            <div className="w-12 font-black font-comic text-2xl text-black">
                                {statValue}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
