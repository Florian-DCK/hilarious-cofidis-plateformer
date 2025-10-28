import Link from 'next/link';
export default function GameHome() {
	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold mb-4">Sélection des niveaux</h1>
			<Link className="underline text-red-600" href="/game/1">
				Jouer Niveau 1
			</Link>
		</main>
	);
}
