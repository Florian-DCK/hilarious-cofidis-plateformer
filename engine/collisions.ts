import type { Rect } from './types';

export const aabb = (r1: Rect, r2: Rect) =>
	r1.x < r2.x + r2.w &&
	r1.x + r1.w > r2.x &&
	r1.y < r2.y + r2.h &&
	r1.y + r1.h > r2.y;

export function resolvePlatform(
	player: Rect & { vx: number; vy: number; onGround: boolean },
	p: Rect
) {
	if (!aabb(player, p)) return;

	const prevX = player.x - player.vx;
	const prevY = player.y - player.vy;

	// Calcul des chevauchements sur chaque axe
	const overlapLeft = player.x + player.w - p.x;
	const overlapRight = p.x + p.w - player.x;
	const overlapTop = player.y + player.h - p.y;
	const overlapBottom = p.y + p.h - player.y;

	// Trouver le plus petit chevauchement pour déterminer le côté de collision
	const minOverlap = Math.min(
		overlapLeft,
		overlapRight,
		overlapTop,
		overlapBottom
	);

	// Collision par le dessus (atterrissage)
	if (minOverlap === overlapTop && player.vy >= 0 && prevY + player.h <= p.y) {
		player.y = p.y - player.h;
		player.vy = 0;
		player.onGround = true;
		return 'top';
	}

	// Collision par le dessous (tête contre la plateforme)
	if (minOverlap === overlapBottom && player.vy < 0 && prevY >= p.y + p.h) {
		player.y = p.y + p.h;
		player.vy = 0;
		return 'bottom';
	}

	// Collision par la gauche
	if (minOverlap === overlapLeft && player.vx > 0 && prevX + player.w <= p.x) {
		player.x = p.x - player.w;
		player.vx = 0;
		return 'left';
	}

	// Collision par la droite
	if (minOverlap === overlapRight && player.vx < 0 && prevX >= p.x + p.w) {
		player.x = p.x + p.w;
		player.vx = 0;
		return 'right';
	}
}
