// src/lib/swrFetcher.ts
// SWR fetcher utilities for client-side data fetching with caching

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

export const postFetcher = async (url: string, { arg }: { arg: unknown }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = new Error('An error occurred while posting the data.');
    throw error;
  }
  return res.json();
};

export const putFetcher = async (url: string, { arg }: { arg: unknown }) => {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = new Error('An error occurred while updating the data.');
    throw error;
  }
  return res.json();
};

export const patchFetcher = async (url: string, { arg }: { arg: unknown }) => {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = new Error('An error occurred while updating the data.');
    throw error;
  }
  return res.json();
};

export const deleteFetcher = async (url: string) => {
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = new Error('An error occurred while deleting the data.');
    throw error;
  }
  return res.json();
};
