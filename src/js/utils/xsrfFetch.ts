const headerName = 'X-CSRF-Token';
let xsrfToken = '';

// A fetch request which will attach an X-CSRF-Token in all outbound requests.
const xsrfFetch = async (
  url: URL,
  requestDetails: RequestInit
): Promise<Response> => {
  if (url.hostname.endsWith('.roblox.com')) {
    if (!requestDetails) {
      requestDetails = {};
    }

    requestDetails.credentials = 'include';

    if (!requestDetails.headers) {
      requestDetails.headers = new Headers();
    }

    if (requestDetails.headers instanceof Headers) {
      if (xsrfToken) {
        requestDetails.headers.set(headerName, xsrfToken);
      }

      if (requestDetails.body && !requestDetails.headers.has('Content-Type')) {
        requestDetails.headers.set('Content-Type', 'application/json');
      }
    }
  }

  const response = await fetch(url, requestDetails);
  const token = response.headers.get(headerName);
  if (response.ok || !token) {
    return response;
  }

  xsrfToken = token;
  return xsrfFetch(url, requestDetails);
};

export default xsrfFetch;
