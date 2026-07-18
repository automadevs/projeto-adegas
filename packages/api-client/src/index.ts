export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly correlationId?: string;
}

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly getAccessToken?: () => string | undefined;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async request<TResponse>(
    path: string,
    init: RequestInit = {}
  ): Promise<TResponse> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");

    const token = this.options.getAccessToken?.();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      headers
    });

    if (!response.ok) {
      throw await response.json() as ProblemDetails;
    }

    return await response.json() as TResponse;
  }
}
