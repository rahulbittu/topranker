/**
 * Test Utilities — Sprint 106
 * Shared mocks and helpers for test files.
 * Owner: Sarah Nakamura (Lead Engineer)
 */

/** Mock Express request */
export function mockRequest(overrides: Record<string, any> = {}) {
  return {
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    headers: {},
    query: {},
    params: {},
    body: {},
    isAuthenticated: () => true,
    user: { id: "test-user", email: "test@topranker.com" },
    ...overrides,
  } as any;
}

/** Mock Express response with header capture */
export function mockResponse() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let jsonBody: any = null;

  const res: any = {
    headers,
    statusCode,
    setHeader: (key: string, value: string) => { headers[key] = value; },
    status: (code: number) => { statusCode = code; res.statusCode = code; return res; },
    json: (body: any) => { jsonBody = body; res.jsonBody = body; return res; },
    send: (body: any) => { res.body = body; return res; },
    write: (data: string) => true,
    writeHead: (code: number, hdrs: Record<string, string>) => {
      statusCode = code;
      Object.assign(headers, hdrs);
    },
    on: (event: string, cb: Function) => res,
    end: () => {},
  };

  return res;
}

/** No-op next function */
export const mockNext = () => {};

/** Create a mock admin request */
export function mockAdminRequest(overrides: Record<string, any> = {}) {
  return mockRequest({
    user: { id: "admin-1", email: "admin@topranker.com" },
    ...overrides,
  });
}

/** Assert that a header exists with expected value */
export function expectHeader(headers: Record<string, string>, key: string, expected: string) {
  const value = headers[key];
  if (!value) throw new Error(`Header "${key}" not set`);
  if (!value.includes(expected)) {
    throw new Error(`Header "${key}" expected to include "${expected}", got "${value}"`);
  }
}
