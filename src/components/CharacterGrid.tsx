import { CharacterCard } from './CharacterCard'
import type { Character } from './CharacterCard'

interface CharacterGridProps {
    characters: Character[]
}

export function CharacterGrid({ characters }: CharacterGridProps) {
    // Check if there are no characters
    if (characters.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                    <h2 className="text-2xl font-comic text-black">NO HEROES FOUND</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-6">
            {characters.map((char) => (
                <CharacterCard
                    key={char.id}
                    character={char}
                />
            ))}
        </div>
    )
}
