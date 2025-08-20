export abstract class BaseUseCase<I, O> {
  abstract execute(input: I): Promise<O>;
}

export abstract class UseCaseWithoutInput<O> extends BaseUseCase<void, O> {
  abstract execute(): Promise<O>;
}
