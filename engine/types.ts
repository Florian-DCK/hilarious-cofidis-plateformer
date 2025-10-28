export type Rect = { x: number; y: number; w: number; h: number };

export type LevelLayout = {
	theme: string;
	starsMax: number;
	player: { spawn: { x: number; y: number } };
	parallax: { image?: string; color?: string; speed: number }[];
	platforms: {
		x: number;
		y: number;
		w: number;
		h: number;
		type: 'static' | 'moving';
		dx?: number;
		dy?: number;
		speed?: number;
	}[];
	collectables: { x: number; y: number; kind: 'sun' }[];
	obstacles: (
		| { type: 'storm'; path: { yMin: number; yMax: number }; speed: number }
		| { type: 'fallingRock'; spawn: { x: number }; intervalMs: number }
	)[];
	goal: Rect;
};
