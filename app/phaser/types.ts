export type LevelLayout = {
	width: number;
	height: number;
	layers: {
		objects: Array<{
			x: number;
			y: number;
			type: string;
		}>;
	}[];
};
