import Random from "./Random";

export default class PerlinNoise2D {
    private static permutation: number[] = [...Array(256)].map((_, i) => i);
    private static p: number[] = [...PerlinNoise2D.permutation, ...PerlinNoise2D.permutation];
    private seed: number;
    
    constructor(seed: number = Random.uniform()) {
        this.seed = seed;
        this.shufflePermutation();
    }

    private shufflePermutation() {
        const random = this.seededRandom(this.seed);
        for (let i = PerlinNoise2D.permutation.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [PerlinNoise2D.permutation[i], PerlinNoise2D.permutation[j]] = [PerlinNoise2D.permutation[j], PerlinNoise2D.permutation[i]];
        }
        PerlinNoise2D.p = [...PerlinNoise2D.permutation, ...PerlinNoise2D.permutation];
    }

    private seededRandom(seed: number): () => number {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 7;
        const u = h < 4 ? x : y;
        const v = h < 4 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    public noise(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const aa = PerlinNoise2D.p[X] + Y;
        const ab = PerlinNoise2D.p[X] + Y + 1;
        const ba = PerlinNoise2D.p[X + 1] + Y;
        const bb = PerlinNoise2D.p[X + 1] + Y + 1;

        const gradAA = this.grad(PerlinNoise2D.p[aa], x, y);
        const gradBA = this.grad(PerlinNoise2D.p[ba], x - 1, y);
        const gradAB = this.grad(PerlinNoise2D.p[ab], x, y - 1);
        const gradBB = this.grad(PerlinNoise2D.p[bb], x - 1, y - 1);

        const lerpX1 = this.lerp(u, gradAA, gradBA);
        const lerpX2 = this.lerp(u, gradAB, gradBB);

        return this.lerp(v, lerpX1, lerpX2);
    }
}