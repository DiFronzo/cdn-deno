/**
* CDN for Github and Deno.land
*/
import {
  h,
  jsx,
  PathParams,
  serve,
  VNode,
} from "https://deno.land/x/sift@0.3.1/mod.ts";
//Inspired by https://github.com/kt3k/proxy-d-ts

/**
* Sends a response and return response
*
* @param request - The request info
* @param params - The parameters from the url
*
* @returns The response of either GitHub or Deno.land
*/
const handleCDNLink = async (
  request: Request,
  params: PathParams,
): Promise<Response> => {
  if (!params) {
    return jsx(<NotFound />, { status: 404 });
  }
  const exp: string[] = request.url.split(
    /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
  );
  const MATCHER = /^([^\/]+)\/([^\/@]+)(@)?(.*)/;
  const m = MATCHER.exec(exp[5].slice(1));
  if (!m) {
    return jsx(<NotFound />, { status: 404 });
  }
  const [, owner, repo, versionSpecified, rest] = m;

  if (!owner || !repo) {
    return jsx(<NotFound />, { status: 404 });
  }

  let dtsUrl = "";
  if (m[1] == "x") {
    if (m[3]) {
      const VERSON = /(.+?)(?=\/)(.*)/;
      const m2 = VERSON.exec(rest);
      if (m2) {
        dtsUrl = `https://cdn.deno.land/${repo}/versions/${m2[1]}/raw/${m2[2]}`;
      } else {
        dtsUrl = `https://cdn.deno.land/${repo}/versions/${rest}/raw/mod.ts`;
      }
    } else {
      // https://cdn.deno.land/oak/meta/versions.json
      return jsx(<NotFound />, { status: 404 });
    }
  } else {
    dtsUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${
      versionSpecified ? "" : "master"
    }${rest || "/mod.ts"}`;
  }

  const resp: Response = await fetch(dtsUrl);

  if (resp.status !== 200) {
    return jsx(<NotFound />, { status: 404 });
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

const Span = (props: { children?: string; bg: string; leading?: boolean }) => {
  const { children, bg, leading } = props;
  return (
    <span
      className={`rounded px-2 h-6 inline-flex items-center text-white text-sm` +
        (bg ? ` ${bg}` : "") +
        (leading ? ` mr-2` : ` mx-2`)}
    >
      {children}
    </span>
  );
};

const values = {
  title: "CDN for Deno",
  description:
    "An easier way to use code from GitHub and Deno Land in your Deno project.",
  creator: "DiFronzo",
};

const Layout = (props: { children?: VNode }) => {
  const { children } = props;
  return (
    // <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/tailwindcss@1.9.6/dist/tailwind.min.css"
          crossOrigin="anonymous"
        />
        <title>{values.title}</title>
        <link rel="shortcut icon" href="https://deno.land/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://deno.land/images/icons/apple-touch-icon-180x180.png"
        />
        <link rel="icon" sizes="32x32" href="https://deno.land/favicon.ico" />
        <meta name="title" content={values.title} key="title" />
        <meta
          name="description"
          content={values.description}
          key="description"
        />
        <meta property="og:url" content="https://cdn.vfiles.no/" key="og-url" />
        <meta property="og:title" content={values.title} key="og-title" />
        <meta
          property="og:description"
          content={values.description}
          key="og-description"
        />
        <meta property="og:type" content="website" key="og-type" />
        <meta name="twitter:title" content={values.title} key="twitter-title" />
        <meta name="twitter:card" content="summary" key="twitter-card" />
        <meta
          name="twitter:creator"
          content={values.creator}
          key="twitter-creator"
        />
        <meta
          name="twitter:description"
          content={values.description}
          key="twitter-description"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

const getQueryStringParam = (url: string, param: string): string => {
  const searchParams = new URLSearchParams(new URL(url).search.slice(1));
  const queryParam = searchParams.get(param);
  return queryParam ? queryParam : "";
};

const CDN = (props: { urlShit: string; urlShitChange: string }) => {
  const { urlShit, urlShitChange } = props;
  return (
    <Layout>
      <div>
        <header className="border-b border-gray-200 py-3">
          <div
            className="container px-2 max-w-2xl mx-auto flex items-center justify-between"
          >
            <h1 className="text-3xl flex items-center">
              <a
                href="/"
              >
                <img
                  className="w-12 h-12"
                  width="12"
                  height="12"
                  src="https://deno.land/logo.svg"
                  alt="Deno Logo"
                />
              </a>&nbsp; CDN for Deno
            </h1>
            <div>
              <a
                href="https://github.com/DiFronzo/deno-toolforge"
                aria-label="Github"
                target="_blank"
                rel="noopener nofollow"
              >
                <svg
                  id="i-github"
                  alt="Github"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="32"
                  height="32"
                >
                  <path
                    strokeWidth="0"
                    fill="currentColor"
                    d="M32 0 C14 0 0 14 0 32 0 53 19 62 22 62 24 62 24 61 24 60 L24 55 C17 57 14 53 13 50 13 50 13 49 11 47 10 46 6 44 10 44 13 44 15 48 15 48 18 52 22 51 24 50 24 48 26 46 26 46 18 45 12 42 12 31 12 27 13 24 15 22 15 22 13 18 15 13 15 13 20 13 24 17 27 15 37 15 40 17 44 13 49 13 49 13 51 20 49 22 49 22 51 24 52 27 52 31 52 42 45 45 38 46 39 47 40 49 40 52 L40 60 C40 61 40 62 42 62 45 62 64 53 64 32 64 14 50 0 32 0 Z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </header>
        <div className="container px-2 max-w-2xl mx-auto">
          <div className="my-5 text-xl">
            To use GitHub or Deno Land as a package registry for Deno, you only
            need to replace{" "}
            <code className="text-sm bg-gray-200 rounded p-1">github.com</code>
            {"  "}or{" "}
            <code className="text-sm bg-gray-200 rounded p-1">deno.land</code>
            {" "}
            with{" "}
            <code className="text-sm bg-gray-200 rounded p-1">
              cdn.vfiles.no
            </code>{" "}
            like this:
          </div>
          <div className="my-5 text-gray-400">
            <Span leading bg="bg-green-500">
              https://cdn.vfiles.no
            </Span>
            /<Span bg="bg-black">user or x</Span>/
            <Span bg="bg-black">repo or repo@tag</Span>/
            <Span bg="bg-black">path/to/file</Span>
          </div>
          <div className="my-5 text-xl">Example:</div>
          <div className="my-5">
            <pre className="bg-black rounded-lg text-gray-200 overflow-auto">
              <code>
                {`
  import { opn } from 'https://cdn.vfiles.no/hashrock/deno-opn/opn.ts'
  opn('https://deno.land')
  `}
              </code>
            </pre>
          </div>
          <form className="flex max-w-sm w-full overflow-hidden mx-auto">
            <input
              name="url"
              type="string"
              id="UrlCode"
              value={urlShit}
              className="rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white"
              placeholder="https://github.com/hashrock/deno-opn/opn.ts"
            />
            <button
              className="px-8 rounded-r-lg bg-green-500 text-gray-800 font-bold p-4 uppercase border-green-600 border-t border-b border-r"
            >
              Create link
            </button>
          </form>
          {urlShitChange
            ? (
              <div class="-m-2 text-center">
                <div class="p-2">
                  <div
                    class="inline-flex items-center bg-white leading-none text-black-600 rounded-full p-2 shadow text-teal text-sm"
                  >
                    <span
                      class="inline-flex bg-green-500 text-black rounded-full h-6 px-3 justify-center items-center"
                    >
                      Link
                    </span>
                    <span class="inline-flex px-2">{urlShitChange}</span>
                  </div>
                </div>
              </div>
            )
            : ""}
        </div>
        <footer className="border-t border-gray-200 my-10 py-5 text-gray-500">
          <div className="text-black container px-2 max-w-2xl mx-auto">
            MIT.
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export const handleCDN = (request: Request) => {
  const urlShit = "";
  let urlShitChange = "";
  const getValueQ = getQueryStringParam(request.url, "url");
  if (getValueQ) {
    const MATCH =
      /[A-Za-z]+:\/\/([A-Za-z0-9\-_]+)(\.[A-Za-z0-9\-_:%&;\?\#\/.=@]+)/;
    const siteFound = MATCH.exec(getValueQ);
    if (siteFound && siteFound[1].toLowerCase() == "deno") {
      urlShitChange = "https://cdn.vfiles.no" + siteFound[2].slice(5);
    } else if (siteFound && siteFound[1].toLowerCase() == "github") {
      urlShitChange = "https://cdn.vfiles.no" + siteFound[2].slice(4);
    }
  }

  return jsx(<CDN urlShit={urlShit} urlShitChange={urlShitChange} />, {
    status: 200,
  });
};

export const NotFound = () => (
  <div>
    <h1>Page not found</h1>
  </div>
);

serve({
  "/": handleCDN,
  "/:slug+": handleCDNLink,
  404: () => jsx(<NotFound />, { status: 404 }),
});
