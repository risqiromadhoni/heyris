---
title: "Google Places session token: one token per search"
summary: "A session token groups typing and place selections into one billing session in Places API (New)."
date: 2026-11-14
topic: api
icon: gauge
label: "Google Places session token"
tags: ["Google Places"]
tldr: "Use one token per search. Send the same token to Autocomplete and Place Details, then create a new token for the next search."
pinned: true
---

Google Places API (New) uses a session token to group the typing and place selection of one search into a single billing session.

## When a session starts and ends

A session starts when the first Autocomplete request uses the token. It ends when a Place Details (New) or Address Validation call uses the same token. Session billing depends on the field tier of the closing Place Details call, such as Essentials or Pro.

A session also ends when the user leaves the search without choosing a place. An abandoned session means every Autocomplete request is billed on its own, as if there were no session. The Places API (New) docs do not state a time limit for this.

## Token rules

- Create a new token for each session. Google recommends a version 4 UUID.
- The token must be a base64 string that is safe for URLs and file names, with at most 36 ASCII characters.
- A token that breaks these rules is rejected with INVALID_ARGUMENT.
- Once a session ends, its token is no longer valid.

If the token is left out, or reused for another session, each request is billed on its own.

## How the `autocomplete-places` repo uses the token

In my repo, the server creates the token with `crypto.randomUUID()` on the first Autocomplete request. It removes the session from the cache after Place Details succeeds. The client creates a new `sessionId` after that.

The snippets below are short sketches of those two calls, not copies from the repo.

```ts
// The X-Goog-Api-Key header is left out to keep the example short.
const sessionToken = crypto.randomUUID();

// Autocomplete (New): the token is sent in the body.
await fetch("https://places.googleapis.com/v1/places:autocomplete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ input, sessionToken }),
});

// Place Details (New): the same token closes the session.
await fetch(
  `https://places.googleapis.com/v1/places/${placeId}?sessionToken=${sessionToken}&fields=id,formattedAddress`
);
```

## Two things to check

The repo keeps the tokens in a `Map` in server memory. If Autocomplete and Place Details run on different server instances, Place Details runs without a token. Google does not recognize that call as closing the session, so the session is abandoned and every Autocomplete request is billed on its own. The code comments also suggest Redis for production.

The repo also removes sessions created more than 3 minutes ago, and the cleanup runs every hour. The Places API (New) docs do not mention that 3-minute figure. The cleanup uses the creation time, not the last time the session was used, so a session that is still in use can be removed in the middle of a search. The next Autocomplete request then gets a new token. The old session is never closed, so its requests are billed on their own.
