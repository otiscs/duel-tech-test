type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// utility function to handle try/catch
export async function tryCatch<T, E = Error>(
  callback: (() => Promise<T>) | (() => T) | Promise<T>
): Promise<Result<T, E>> {
  try {
    return {
      data: await (typeof callback === "function" ? callback() : callback),
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
