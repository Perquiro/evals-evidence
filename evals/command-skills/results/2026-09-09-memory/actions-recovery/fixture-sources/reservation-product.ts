import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

export type ReservationState = "none" | "active" | "cancelled";
export type ProductEvent =
  | { kind: "state_read"; state: ReservationState; reservationCount: number }
  | { kind: "reserve"; attemptId: string | undefined; reason: string }
  | { kind: "cancel"; attemptId: string | undefined; reason: string };

export type ReservationProduct = {
  url: string;
  events: ProductEvent[];
  close: () => Promise<void>;
  readState: () => Promise<ReservationState>;
  cancel: (attemptId: string) => Promise<void>;
  cancelWithoutReadingResponse: (attemptId: string) => Promise<void>;
  reservationCount: () => number;
};

// This is a disposable HTTP Product, not a mocked Perquiro service. It keeps
// the mutation ledger at the Product boundary so an Explore write cannot be
// mistaken for a cancellation dispatch.
export async function startReservationProduct(creating = false, onEvent?: (event: ProductEvent) => void, onRequest?: (request: { method: string; path: string }) => void): Promise<ReservationProduct> {
  let state: ReservationState = creating ? "none" : "active";
  let reservationCount = creating ? 0 : 1;
  const events: ProductEvent[] = [];
  const record = (event: ProductEvent): void => { events.push(event); onEvent?.(event); };
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://reservation-product");
    onRequest?.({ method: request.method ?? "GET", path: url.pathname });
    const sendJson = (status: number, body: unknown): void => {
      response.writeHead(status, { "content-type": "application/json" });
      response.end(JSON.stringify(body));
    };
    const sendHtml = (status: number, body: string): void => {
      response.writeHead(status, { "content-type": "text/html; charset=utf-8" });
      response.end(body);
    };
    if (request.method === "GET" && url.pathname === "/api/reservations/42") {
      record({ kind: "state_read", state, reservationCount });
      sendJson(200, { id: "42", state, reservationCount, version: "2.5" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/reserve") {
      sendHtml(200, '<main><h1>Reserve</h1><form method="post" action="/reservations"><button type="submit">Reserve</button></form></main>');
      return;
    }
    if (request.method === "POST" && url.pathname === "/reservations") {
      const attempt = request.headers["x-perquiro-attempt-id"];
      record({ kind: "reserve", attemptId: Array.isArray(attempt) ? attempt[0] : attempt, reason: "" });
      reservationCount += 1;
      state = "active";
      sendHtml(201, '<main><h1>Reservation created</h1><a href="/reservations/42">Reservation details</a></main>');
      return;
    }
    if (request.method === "GET" && url.pathname === "/reservations/42") {
      sendHtml(200, `<main><h1>Reservation details</h1><p>Status: ${state}</p><button type="button" onclick="document.getElementById('actions').hidden=!document.getElementById('actions').hidden">Actions</button><div id="actions" hidden><button type="button" onclick="document.querySelector('form').hidden=false">Cancel</button><form hidden method="post" action="/reservations/42/cancel"><label for="reason">Reason</label><input id="reason" name="reason" required><button type="submit">Confirm cancellation</button></form><button type="button">Edit</button><a href="/reservations/42/download">Download</a></div></main>`);
      return;
    }
    if (request.method === "GET" && url.pathname === "/reservations/42/download") {
      sendHtml(200, "<main><h1>Download</h1></main>");
      return;
    }
    if (request.method === "POST" && url.pathname === "/reservations/42/cancel") {
      const values = new URLSearchParams(await requestBody(request));
      const reason = values.get("reason") ?? "";
      const attempt = request.headers["x-perquiro-attempt-id"];
      record({ kind: "cancel", attemptId: Array.isArray(attempt) ? attempt[0] : attempt, reason });
      if (reason.trim().length === 0) {
        sendHtml(422, '<main><h1>Actions</h1><p>Reason is required.</p></main>');
        return;
      }
      state = "cancelled";
      sendHtml(200, "<main><p>Status: cancelled</p></main>");
      return;
    }
    sendJson(404, { error: "not found" });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${String(address.port)}`;
  async function readState(): Promise<ReservationState> {
    const response = await fetch(`${url}/api/reservations/42`);
    assert.equal(response.status, 200);
    const body: unknown = await response.json();
    assert.equal(typeof body, "object");
    assert.ok(body !== null);
    const candidate = (body as { state?: unknown }).state;
    assert.ok(candidate === "none" || candidate === "active" || candidate === "cancelled");
    return candidate;
  }
  async function cancelWithoutReadingResponse(attemptId: string): Promise<void> {
    // fetch resolving means the Product accepted the request headers. Deliberately
    // never inspect the response body: this models the host stopping there.
    await fetch(`${url}${creating ? "/reservations" : "/reservations/42/cancel"}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-perquiro-attempt-id": attemptId },
      body: "reason=Customer+requested+cancellation",
    });
  }
  async function cancel(attemptId: string): Promise<void> {
    const response = await fetch(`${url}${creating ? "/reservations" : "/reservations/42/cancel"}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-perquiro-attempt-id": attemptId },
      body: "reason=Customer+requested+cancellation",
    });
    assert.equal(response.status, creating ? 201 : 200);
    assert.match(await response.text(), creating ? /Reservation created/ : /Status: cancelled/);
  }
  return {
    url, events, readState, cancel, cancelWithoutReadingResponse, reservationCount: () => reservationCount,
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}

function requestBody(request: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => { body += chunk; });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}
