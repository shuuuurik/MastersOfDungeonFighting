class RandomGenerator {
    private seed: number;
    private nextGaussianValue: number | null = null;
    private static instance: RandomGenerator | null = null;
  
    constructor(seed?: number) {
        if (seed === undefined) {
            seed = Math.floor(Math.random() * 0x7FFFFFFE) + 1;
        } else if (seed <= 0) {
            seed = 1;
        }
        this.seed = seed;
    }

    public static getInstance(): RandomGenerator {
        if (RandomGenerator.instance === null) {
            RandomGenerator.instance = new RandomGenerator(12345);
        }
        return RandomGenerator.instance;
    }
  
    public nextUniform(): number {
      // Генератор Парка-Миллера
      this.seed = (this.seed * 16807) % 2147483647;
      return this.seed / 2147483647;
    }
  
    /**
     * Генерирует число из нормального распределения
     * @param mean - Среднее значение (по умолчанию 0)
     * @param stdDev - Стандартное отклонение (по умолчанию 1)
     */
    public nextGaussian(mean: number = 0, stdDev: number = 1): number {
        if (this.nextGaussianValue !== null) {
            const value = this.nextGaussianValue;
            this.nextGaussianValue = null;
            return value * stdDev + mean;
        }
    
        let u1: number, u2: number, radius: number;
        do {
            u1 = this.nextUniform() * 2 - 1;
            u2 = this.nextUniform() * 2 - 1;
            radius = u1 * u1 + u2 * u2;
        } while (radius >= 1 || radius === 0);

        const scale = Math.sqrt((-2 * Math.log(radius)) / radius);
        this.nextGaussianValue = u2 * scale;
        return u1 * scale * stdDev + mean;
    }
  
    /**
     * Генерирует число из экспоненциального распределения
     * @param lambda - Параметр скорости (lambda > 0)
     */
    public nextExponential(lambda: number): number {
        if (lambda <= 0) {
            throw new Error("Lambda must be positive");
        }
        return -Math.log(1 - this.nextUniform()) / lambda;
    }

    /**
     * Генерирует число из Гамма-распределения (подходит для размера рогов)
     * @param shape - Параметр формы (k > 0)
     * @param scale - Параметр масштаба (θ > 0)
     * Алгоритм: Marsaglia and Tsang для k >= 1, комбинированный метод для k < 1
     */
    public nextGamma(shape: number, scale: number): number {
        if (shape <= 0 || scale <= 0) {
            throw new Error("Shape and scale must be positive");
        }

        if (shape < 1) {
            // Комбинированный метод для k < 1
            const U = this.nextUniform();
            return this.nextGamma(shape + 1, scale) * Math.pow(U, 1 / shape);
        }

        // Метод Marsaglia and Tsang для k >= 1
        const d = shape - 1/3;
        const c = 1 / Math.sqrt(9*d);
        
        let V: number;
        let Z: number;
        do {
            do {
            Z = this.nextGaussian();
            V = 1 + c * Z;
            } while (V <= 0);
            
            V = V * V * V;
            const U = this.nextUniform();
            const X = d * V;
            
            if (U < 1 - 0.0331*(Z*Z)*(Z*Z)) return X * scale;
            if (Math.log(U) < 0.5*Z*Z + d*(1 - V + Math.log(V))) return X * scale;
        } while (true);
    }
}

class Random {
    private constructor() {}
    private static generator: RandomGenerator = RandomGenerator.getInstance();
    public static normal(mean: number = 0, stdDev: number = 1): number {
        return this.generator.nextGaussian(mean, stdDev);
    }

    public static normalPositive(mean: number = 0, stdDev: number = 1): number {
        return Math.abs(this.generator.nextGaussian(mean, stdDev));
    }

    public static exponential(lambda: number = 1): number {
        return this.generator.nextExponential(lambda);
    }

    public static uniform(min: number = 0, max: number = 1): number {
        return min + (max - min) * this.generator.nextUniform();
    }

    public static gamma(shape: number = 4, scale: number = 2): number {
        return this.generator.nextGamma(shape, scale);
    }

    public static normalCDF(z: number): number {
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const cdf = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - cdf : cdf;
    }

}

export default Random;