const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type GetSessionFn = () => Promise<{ user: { accessToken: string } } | null>;

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    getSession?: GetSessionFn;
    token?: string;
  }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = options?.token;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (options?.getSession) {
    const session = await options.getSession();
    if (session?.user?.accessToken) {
      headers["Authorization"] = `Bearer ${session.user.accessToken}`;
    }
  }

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = "An error occurred";
    try {
      const error = await res.json();
      message = error.message || message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function createApiClient(options?: {
  getSession?: GetSessionFn;
  token?: string;
}) {
  const baseOpts = { getSession: options?.getSession, token: options?.token };

  return {
    get<T>(path: string): Promise<T> {
      return request<T>("GET", path, baseOpts);
    },
    post<T>(path: string, body?: unknown): Promise<T> {
      return request<T>("POST", path, { ...baseOpts, body });
    },
    patch<T>(path: string, body?: unknown): Promise<T> {
      return request<T>("PATCH", path, { ...baseOpts, body });
    },
    del<T>(path: string): Promise<T> {
      return request<T>("DELETE", path, baseOpts);
    },
  };
}
