<script lang="ts">
	import { onMount } from 'svelte';

	// The hero's coiled-ribbon graphic — hand-authored inline SVG, no raster, no
	// external asset. Everything about it is designed to survive being frozen:
	// the bands are authored at staggered angles and radii, so the *resting*
	// composition (what a `prefers-reduced-motion` visitor sees) is the composed
	// one. Rotation adds life; it does not create the arrangement.
	//
	// Per band, back to front:
	//   1. occlusion — two wide, offset, near-black copies at low opacity, so a
	//      band reads as sitting *in front of* the one behind rather than beside
	//      it. Deliberately NOT a Gaussian blur: the occlusion has to rotate with
	//      its band, and a filtered subtree that animates is re-rasterised every
	//      frame. Two stacked soft strokes buy the same read for no filter cost —
	//      which is why this file ships zero <filter> elements;
	//   2. body — three tapering sub-arcs sharing one gradient, whose narrow
	//      specular crest (15% of the ramp) is what makes a stroke read as a
	//      turned, glossy surface;
	//   3. rim — a hairline catching light along ~28% of the arc's leading edge.
	//
	// Behind all of it sits a single radial-gradient bloom (a gradient, not a
	// blurred shape — free instead of expensive).
	//
	// Colours come from `app.css` by class, never from inline attributes:
	// `var()` is not honoured inside SVG presentation attributes, so class-based
	// styling is the only way both palettes can drive the same markup.

	const CX = 380;
	const CY = 380;
	const RAD = Math.PI / 180;

	// radius · sweep · start angle · stroke width · rotation period · direction.
	// The start angles are deliberately unrelated to one another: that is what
	// breaks concentricity and makes the eye trace a spiral rather than a target.
	const BANDS = [
		{ r: 348, sweep: 236, from: -18, w: 44, dur: 74, reverse: false, depth: 'near' },
		{ r: 300, sweep: 214, from: 34, w: 38, dur: 61, reverse: true, depth: 'near' },
		{ r: 254, sweep: 248, from: -64, w: 32, dur: 52, reverse: false, depth: 'near' },
		{ r: 208, sweep: 198, from: 96, w: 27, dur: 45, reverse: true, depth: 'far' },
		{ r: 164, sweep: 262, from: 12, w: 21, dur: 38, reverse: false, depth: 'far' },
		{ r: 122, sweep: 186, from: -110, w: 16, dur: 32, reverse: true, depth: 'far' },
		{ r: 84, sweep: 274, from: 58, w: 11, dur: 28, reverse: false, depth: 'far' }
	] as const;

	function polar(r: number, deg: number): [number, number] {
		return [CX + r * Math.cos(deg * RAD), CY + r * Math.sin(deg * RAD)];
	}

	function arc(r: number, from: number, to: number): string {
		const [x1, y1] = polar(r, from);
		const [x2, y2] = polar(r, to);
		const large = Math.abs(to - from) > 180 ? 1 : 0;
		return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
	}

	// A constant-width stroke reads as a circle tool. Three overlapping
	// sub-arcs of decreasing weight read as a ribbon narrowing toward one tip;
	// the round caps hide the joins.
	const TAPER = [
		{ at: 0, to: 0.42, scale: 1 },
		{ at: 0.38, to: 0.74, scale: 0.8 },
		{ at: 0.7, to: 1, scale: 0.58 }
	];

	const bands = BANDS.map((band, i) => {
		// Gradient vector rotated by the band's own start angle, so no two
		// specular crests line up — the light source stays consistent, the
		// crests do not repeat.
		const a = (band.from + 40) * RAD;
		const dx = Math.cos(a) * band.r;
		const dy = Math.sin(a) * band.r;

		return {
			i,
			...band,
			gradient: { x1: CX - dx, y1: CY - dy, x2: CX + dx, y2: CY + dy },
			full: arc(band.r, band.from, band.from + band.sweep),
			segments: TAPER.map((t) => ({
				d: arc(band.r, band.from + band.sweep * t.at, band.from + band.sweep * t.to),
				width: +(band.w * t.scale).toFixed(1)
			})),
			// Offset the rim dash per band so the lit edge sits in a different
			// place on each one.
			rimOffset: +(-0.14 - i * 0.09).toFixed(2)
		};
	});

	const near = bands.filter((b) => b.depth === 'near');
	const far = bands.filter((b) => b.depth === 'far');

	let host = $state<HTMLElement | null>(null);
	let running = $state(true);

	// Animation lifecycle. Seven continuously rotating bands is a real battery
	// cost, so they run only while the graphic is on screen and the tab is
	// visible. `running` drives a class; the pausing itself is CSS.
	onMount(() => {
		if (!host) return;

		let onScreen = true;
		const sync = () => (running = onScreen && !document.hidden);

		const observer = new IntersectionObserver(
			([entry]) => {
				onScreen = entry.isIntersecting;
				sync();
			},
			{ threshold: 0 }
		);
		observer.observe(host);
		document.addEventListener('visibilitychange', sync);

		return () => {
			observer.disconnect();
			document.removeEventListener('visibilitychange', sync);
		};
	});

	// Pointer parallax. Attached only for fine pointers that aren't asking for
	// reduced motion — and re-evaluated live, so toggling the OS setting takes
	// effect without a reload.
	onMount(() => {
		const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
		const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
		const section = host?.closest('section') ?? null;
		if (!section) return;

		let frame = 0;
		let attached = false;

		function onMove(event: PointerEvent) {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const box = (section as HTMLElement).getBoundingClientRect();
				host?.style.setProperty('--px', ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
				host?.style.setProperty('--py', ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
			});
		}

		function sync() {
			const want = fine.matches && !calm.matches;
			if (want === attached) return;
			attached = want;
			if (want) {
				section!.addEventListener('pointermove', onMove, { passive: true });
			} else {
				section!.removeEventListener('pointermove', onMove);
				host?.style.removeProperty('--px');
				host?.style.removeProperty('--py');
			}
		}

		sync();
		fine.addEventListener('change', sync);
		calm.addEventListener('change', sync);

		return () => {
			fine.removeEventListener('change', sync);
			calm.removeEventListener('change', sync);
			section!.removeEventListener('pointermove', onMove);
			cancelAnimationFrame(frame);
		};
	});
</script>

<div bind:this={host} class="hero-graphic" class:is-paused={!running} aria-hidden="true">
	<svg viewBox="0 0 760 760" preserveAspectRatio="xMidYMid meet" fill="none" focusable="false" role="presentation">
		<defs>
			{#each bands as band (band.i)}
				<linearGradient
					id="rb-{band.i}"
					gradientUnits="userSpaceOnUse"
					x1={band.gradient.x1.toFixed(0)}
					y1={band.gradient.y1.toFixed(0)}
					x2={band.gradient.x2.toFixed(0)}
					y2={band.gradient.y2.toFixed(0)}
				>
					<stop class="rb-0" offset="0%" />
					<stop class="rb-1" offset="16%" />
					<stop class="rb-2" offset="34%" />
					<stop class="rb-3" offset="48%" />
					<stop class="rb-crest" offset="55%" />
					<stop class="rb-3" offset="63%" />
					<stop class="rb-4" offset="80%" />
					<stop class="rb-5" offset="100%" />
				</linearGradient>
			{/each}

			<radialGradient id="rb-bloom" cx="0.5" cy="0.5" r="0.5">
				<stop class="rb-bloom-core" offset="0%" />
				<stop class="rb-bloom-mid" offset="55%" />
				<stop class="rb-bloom-edge" offset="100%" />
			</radialGradient>

		</defs>

		<!-- Atmosphere. A gradient, not a blurred shape. -->
		<ellipse class="rb-atmosphere" cx="400" cy="360" rx="360" ry="330" fill="url(#rb-bloom)" />

		<g class="rb-cluster">
			{#each [{ key: 'near', list: near }, { key: 'far', list: far }] as layer (layer.key)}
				<g class="rb-layer rb-layer-{layer.key}">
					{#each layer.list as band (band.i)}
						<g
							class="rb-band rb-band-{band.i + 1}"
							style:--rb-dur="{band.dur}s"
							style:animation-direction={band.reverse ? 'reverse' : 'normal'}
						>
							<!-- 1 · occlusion -->
							<path class="rb-occlusion rb-occlusion-wide" d={band.full} stroke-width={(band.w * 1.4).toFixed(1)} />
							<path class="rb-occlusion" d={band.full} stroke-width={(band.w * 1.15).toFixed(1)} />
							<!-- 2 · body, tapering across three sub-arcs -->
							{#each band.segments as segment, s (s)}
								<path class="rb-body" d={segment.d} stroke="url(#rb-{band.i})" stroke-width={segment.width} />
							{/each}
							<!-- 3 · rim -->
							<path class="rb-rim" d={band.full} pathLength="1" stroke-dashoffset={band.rimOffset} />
						</g>
					{/each}
				</g>
			{/each}
		</g>
	</svg>
</div>
