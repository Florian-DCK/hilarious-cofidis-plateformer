// app/game/[level]/engine/sprites.ts
export function clear(
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	color = '#0b0b0b'
) {
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, w, h);
}
export function rect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	color = '#fff'
) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}
export function image(
	img: HTMLImageElement,
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w?: number,
	h?: number
) {
	if (w && h) ctx.drawImage(img, x, y, w, h);
	else ctx.drawImage(img, x, y);
}
