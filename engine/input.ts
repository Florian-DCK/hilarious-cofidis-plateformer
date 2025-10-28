export function makeInput(el: HTMLElement) {
	const keys = new Set<string>();
	const down = (e: KeyboardEvent) => {
		keys.add(e.key);
	};
	const up = (e: KeyboardEvent) => {
		keys.delete(e.key);
	};
	window.addEventListener('keydown', down);
	window.addEventListener('keyup', up);
	return {
		left: () => keys.has('ArrowLeft') || keys.has('a'),
		right: () => keys.has('ArrowRight') || keys.has('d'),
		up: () => keys.has('ArrowUp') || keys.has('w') || keys.has(' '),
		dispose: () => {
			window.removeEventListener('keydown', down);
			window.removeEventListener('keyup', up);
		},
	};
}
