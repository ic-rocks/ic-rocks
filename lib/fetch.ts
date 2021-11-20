const fetchJSON = (url, opts?) =>
  fetch(url, opts).then((res) => {
    if (!res.ok) {
      throw res.statusText;
    }
    return res.json();
  });

export default fetchJSON;

const authHeaders = (auth: string) => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth}`,
  },
});

export const fetchAuthed = (url, auth, opts?) =>
  fetch(url, { ...authHeaders(auth), ...opts })
    .then((res) => {
      if (!res.ok) {
        throw res.statusText;
      }
      return res.json();
    })
    .catch(() => {
      console.warn("Fetch failed");
    });
