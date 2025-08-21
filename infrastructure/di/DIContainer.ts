type Constructor<T> = new (...args: any[]) => T;

export class DIContainer {
  private static instance: DIContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public register<T>(token: string, instance: T): void {
    this.dependencies.set(token, instance);
  }

  public registerSingleton<T>(token: string, constructor: Constructor<T>, ...args: any[]): void {
    if (!this.dependencies.has(token)) {
      const resolvedArgs = args.map(arg => {
        if (typeof arg === 'string' && this.dependencies.has(arg)) {
          return this.resolve(arg);
        }
        return arg;
      });
      
      const instance = new constructor(...resolvedArgs);
      this.dependencies.set(token, instance);
    }
  }

  public resolve<T>(token: string): T {
    const dependency = this.dependencies.get(token);
    if (!dependency) {
      throw new Error(`Dependency with token ${token} not found`);
    }
    return dependency as T;
  }

  public clear(): void {
    this.dependencies.clear();
  }
}
