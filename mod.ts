/**
* CDN for Github and Deno.land
*/
import { PathParams, serve } from "https://deno.land/x/sift@0.3.1/mod.ts";
//Inspired by https://github.com/kt3k/proxy-d-ts

/**
* Sends a response and return response
*
* @param request - The request info
* @param params - The parameters from the url
*
* @returns The response of either GitHub or Deno.land
*/
const handleCDN = async (
  request: Request,
  params: PathParams,
): Promise<Response> => {
  if (!params) {
    return notFound();
  }

  const exp: string[] = request.url.split(
    /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
  );
  const rootPath: string = exp[5].split("/")[1].toLowerCase();
  const path: string = rootPath == "deno" ? exp[5].slice(5) : exp[5].slice(7);

  if (!path || !(rootPath == "deno" || rootPath == "github")) {
    return notFound();
  }

  // Github or Deno.Land
  const dtsUrl: string = rootPath == "deno"
    ? `https://cdn.deno.land${path}`
    : `https://raw.githubusercontent.com${path}`;

  const resp: Response = await fetch(dtsUrl);

  if (resp.status !== 200) {
    return notFound();
  }

  const isBrowser: boolean | undefined = request.headers.get("accept")
    ?.includes("text/html");

  // The headers on a `Response` are immutable
  const headers: HeadersInit | undefined = new Headers(resp.headers);

  // Responses as plain text to browsers
  headers.set(
    "content-type",
    isBrowser ? "text/plain" : "application/typescript; charset=utf-8",
  );

  // Prevents downloading the file
  headers.delete("content-disposition");

  return new Response(resp.body, { ...resp, headers });
};

serve({
  "/": () => home(),
  "/deno/:slug+": handleCDN,
  "/github/:slug+": handleCDN,
  404: () => notFound(),
});

/**
* The error page, with a back to home link
*/
function notFound(): Response {
  return new Response(`Not Found!<br /><a href="/">Back to Home</a>`, {
    status: 404,
    headers: { "content-type": "text/html" },
  });
}

/**
* The homepage with exaples to check out
*/
function home(): Response {
  return new Response(
    `serving cdn.deno.land (/deno) and raw.githubusercontent.com (/github)<br />
  Example for cdn.deno.land:
    <a href="/deno/oak/versions/v7.5.0/raw/mod.ts">deno/oak/versions/v7.5.0/raw/mod.ts</a><br />
  Example for raw.githubusercontent.com:
    <a href="/github/oakserver/oak/v7.5.0/mod.ts">github/oakserver/oak/v7.5.0/mod.ts</a><br />
  <br />
  `,
    {
      status: 200,
      headers: { "content-type": "text/html" },
    },
  );
}
