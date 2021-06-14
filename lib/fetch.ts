const fetchJSON = (url, opts?) =>
  fetch(url, opts)
    .then((res) => {
      if (!res.ok) {
        throw res.statusText;
      }
      return res.json();
    })
    .catch((e) => {});

export default fetchJSON;
