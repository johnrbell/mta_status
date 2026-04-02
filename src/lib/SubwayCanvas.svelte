<script>
	import { onMount, onDestroy } from 'svelte';

	let canvas;
	let ctx;
	let animId;
	let lines = [];
	let lastSpawnTime = 0;

	const CONFIG = {
		LINE_THICKNESS: 4,
		SPAWN_INTERVAL: 900,
		HOLD_DURATION: 500,
		FADE_DURATION: 2000,
		DURATION_MIN: 2000,
		DURATION_MAX: 5000,
	};

	const COLORS = [
		{ r: 238, g: 53, b: 46 },
		{ r: 0, g: 147, b: 60 },
		{ r: 0, g: 57, b: 166 },
		{ r: 255, g: 99, b: 25 },
		{ r: 185, g: 51, b: 173 },
		{ r: 252, g: 204, b: 10 },
		{ r: 153, g: 102, b: 51 },
		{ r: 167, g: 169, b: 172 }
	];

	const DIRS = [
		{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 },
		{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }
	];

	function diagBetween(fromIdx, toIdx) {
		const d = ((toIdx - fromIdx) % 8 + 8) % 8;
		return d <= 4 ? (fromIdx + 1) % 8 : ((fromIdx - 1) + 8) % 8;
	}

	function resizeCanvas() {
		if (!canvas) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.lineWidth = CONFIG.LINE_THICKNESS;
	}

	function getPointOnEdge(edge) {
		const w = window.innerWidth;
		const h = window.innerHeight;
		switch (edge) {
			case 0: return { x: Math.random() * w - w / 2, y: -h / 2 };
			case 1: return { x: w / 2, y: Math.random() * h - h / 2 };
			case 2: return { x: Math.random() * w - w / 2, y: h / 2 };
			case 3: return { x: -w / 2, y: Math.random() * h - h / 2 };
		}
	}

	function createLine() {
		const startEdge = Math.floor(Math.random() * 4);
		const start = getPointOnEdge(startEdge);
		const w = window.innerWidth;
		const h = window.innerHeight;
		const path = [{ ...start }];
		let cur = { ...start };
		let cardIdx;
		switch (startEdge) {
			case 0: cardIdx = 2; break;
			case 1: cardIdx = 4; break;
			case 2: cardIdx = 6; break;
			case 3: cardIdx = 0; break;
		}
		let lockedH = (cardIdx === 0 || cardIdx === 4) ? cardIdx : null;
		let lockedV = (cardIdx === 2 || cardIdx === 6) ? cardIdx : null;
		const offScreen = () => Math.abs(cur.x) > w / 2 + 50 || Math.abs(cur.y) > h / 2 + 50;
		const turns = Math.floor(Math.random() * 4) + 2;

		for (let t = 0; t < turns; t++) {
			const dir = DIRS[cardIdx];
			const step = 100 + Math.random() * 200;
			cur = { x: Math.round(cur.x + dir.x * step), y: Math.round(cur.y + dir.y * step) };
			path.push({ ...cur });
			if (offScreen()) break;

			let newCardIdx;
			if (cardIdx === 0 || cardIdx === 4) {
				if (lockedV !== null) { newCardIdx = lockedV; }
				else { newCardIdx = cur.y > 0 ? 6 : 2; lockedV = newCardIdx; }
			} else {
				if (lockedH !== null) { newCardIdx = lockedH; }
				else { newCardIdx = cur.x > 0 ? 4 : 0; lockedH = newCardIdx; }
			}
			const diagIdx = diagBetween(cardIdx, newCardIdx);
			const diagDir = DIRS[diagIdx];
			const kinkLen = 25 + Math.random() * 35;
			cur = { x: Math.round(cur.x + diagDir.x * kinkLen), y: Math.round(cur.y + diagDir.y * kinkLen) };
			path.push({ ...cur });
			if (offScreen()) break;
			cardIdx = newCardIdx;
		}

		if (!offScreen()) {
			const dir = DIRS[cardIdx];
			const extend = Math.max(w, h);
			cur = { x: Math.round(cur.x + dir.x * extend), y: Math.round(cur.y + dir.y * extend) };
			path.push({ ...cur });
		}

		let totalLength = 0;
		for (let i = 1; i < path.length; i++) {
			const dx = path[i].x - path[i - 1].x;
			const dy = path[i].y - path[i - 1].y;
			totalLength += Math.sqrt(dx * dx + dy * dy);
		}

		return {
			path, totalLength,
			startTime: performance.now(),
			duration: Math.random() * (CONFIG.DURATION_MAX - CONFIG.DURATION_MIN) + CONFIG.DURATION_MIN,
			state: 'growing', fadeProgress: 0,
			color: COLORS[Math.floor(Math.random() * COLORS.length)]
		};
	}

	function drawLine(line) {
		const now = performance.now();
		let progress = Math.min((now - line.startTime) / line.duration, 1);
		if (line.state === 'growing' && progress >= 1) { line.state = 'holding'; line.holdStart = now; }
		if (line.state === 'holding' && now - line.holdStart > CONFIG.HOLD_DURATION) { line.state = 'fading'; line.fadeStart = now; }
		if (line.state === 'fading') { line.fadeProgress = (now - line.fadeStart) / CONFIG.FADE_DURATION; if (line.fadeProgress >= 1) return false; }

		const length = line.totalLength * progress;
		let drawn = 0;
		ctx.lineCap = 'square';
		ctx.globalCompositeOperation = 'lighter';

		for (let i = 1; i < line.path.length; i++) {
			const p1 = line.path[i - 1];
			const p2 = line.path[i];
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const segLen = Math.sqrt(dx * dx + dy * dy);
			if (drawn + segLen > length) {
				const t = (length - drawn) / segLen;
				drawSegment(p1, { x: p1.x + dx * t, y: p1.y + dy * t }, line);
				break;
			} else {
				drawSegment(p1, p2, line);
				drawn += segLen;
			}
		}
		return true;
	}

	function drawSegment(p1, p2, line) {
		const fade = line.state === 'fading' ? (1 - line.fadeProgress) : 1;
		ctx.strokeStyle = `rgba(${line.color.r},${line.color.g},${line.color.b},${fade})`;
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();
	}

	function animate(now) {
		if (now - lastSpawnTime > CONFIG.SPAWN_INTERVAL) { lines.push(createLine()); lastSpawnTime = now; }
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.translate(canvas.width / 2 / (window.devicePixelRatio || 1), canvas.height / 2 / (window.devicePixelRatio || 1));
		for (let i = lines.length - 1; i >= 0; i--) { if (!drawLine(lines[i])) lines.splice(i, 1); }
		ctx.restore();
		animId = requestAnimationFrame(animate);
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);
		animId = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
		if (typeof window !== 'undefined') window.removeEventListener('resize', resizeCanvas);
	});
</script>

<canvas bind:this={canvas} class="subway-canvas"></canvas>

<style>
	.subway-canvas {
		position: fixed;
		inset: 0;
		z-index: 0;
		display: block;
		width: 100vw;
		height: 100vh;
		opacity: 0.5;
	}
</style>
