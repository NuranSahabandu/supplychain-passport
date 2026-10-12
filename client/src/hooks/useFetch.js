import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Loads data from the API when a page opens, and tracks the three states every
// screen must handle: loading, error, and the data itself.
//
// Usage:  const { data, loading, error, reload, setData } = useFetch('/products');
export function useFetch(path) {
  const [result, setResult] = useState({ data: null, error: null, loading: true });

  // Changing this number is how reload() asks the effect below to run again
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the page closes (or the path changes) before the answer arrives,
    // ignore that old answer instead of showing it.
    let ignore = false;

    api
      .get(path)
      .then((data) => {
        if (!ignore) setResult({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!ignore) setResult({ data: null, error, loading: false });
      });

    return () => {
      ignore = true;
    };
  }, [path, reloadCount]);

  // Load again (e.g. a "Try again" button)
  function reload() {
    setResult((previous) => ({ ...previous, error: null, loading: true }));
    setReloadCount((count) => count + 1);
  }

  // Replace the data shown right away (e.g. with the response after a save)
  function setData(data) {
    setResult((previous) => ({ ...previous, data }));
  }

  return { ...result, reload, setData };
}