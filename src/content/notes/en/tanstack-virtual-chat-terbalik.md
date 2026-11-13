---
title: "Reverse chat with TanStack Virtual"
summary: "With TanStack Virtual 3.13.4, the demo flips the scroll container so the message with the latest time sits at the bottom, then measures each message's height."
date: 2026-11-14
topic: react
icon: code
label: "Reverse chat"
tags: ["React", "TanStack Virtual"]
tldr: "In TanStack Virtual 3.13.4, the demo flips the container and each row with scaleY(-1). The current guide uses a normal container with anchorTo: 'end'."
---

The [tanstack-virtual-chat demo](https://github.com/risqiromadhoni/tanstack-virtual-chat) uses `@tanstack/react-virtual` 3.13.4 to build a chat list. The message with the latest time sits at the bottom. I built it with Next.js 15 and React 19.

## Flipped once, then flipped back

The demo gives the scroll container `scaleY(-1)`, so its contents are flipped vertically. Each row is flipped again so its text stays upright. The demo sorts the data in descending order by hour and minute, so index 0, the message with the latest time, sits at the bottom.

```tsx {title=src/app/_components/Chats.tsx}
<div ref={scrollRef} className="relative flex-1 w-full overflow-y-auto" style={{ transform: "scaleY(-1)" }}>
  <ul className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
    {rowVirtualizerItems.map((rowVirtualizerItem) => (
      <li
        key={rowVirtualizerItem.key}
        data-index={rowVirtualizerItem.index}
        ref={rowVirtualizer.measureElement}
        className="absolute top-0 left-0 w-full"
        style={{ transform: `translateY(${rowVirtualizerItem.start}px) scaleY(-1)` }}
      >
        {/* ... */}
      </li>
    ))}
  </ul>
</div>
```

The snippet is abridged. It does not show the `className` and `style` passed in through props, the `...props` spread, the `chats.find` lookup, or `<ChatBox>`.

Flipping the container reverses the browser's own scrolling. Scrolling the wheel down raises `scrollTop`, so the content moves down on screen. In a normal list, wheel down moves the content up.

That is why the demo adds a `wheel` listener. The listener uses `passive: false`, calls `preventDefault()`, and subtracts `deltaY` from `scrollTop`. With the listener, wheel down moves the content up, toward the message with the latest time.

## Message heights differ

Message lengths vary, so row heights are not fixed. `estimateSize` gives a first estimate of 50 pixels. After a row renders, `measureElement`, attached to its `ref`, measures the real height. TanStack Virtual also expects a `data-index` attribute on that element.

## What the demo does not do

The demo does not call `scrollToIndex` or `scrollToOffset`. Because the container is flipped, scroll position zero sits at the bottom. So the first view already shows the message with the latest time. The demo also loads messages once on the server, from the `/api/chats` endpoint, which returns 2000 messages. No older messages load when you scroll up.

## The current guide needs no flip

Version 3.13.4 does not have the `anchorTo: 'end'` option. It is available in `@tanstack/react-virtual` 3.14.26, through `@tanstack/virtual-core` 3.19.11.

The [TanStack Virtual chat guide](https://tanstack.com/virtual/latest/docs/chat) uses a normal scroll container with normal item order. You do not need `flex-direction: column-reverse` or inverted transforms. The guide uses `anchorTo: 'end'`, calls `scrollToEnd()` after the scroll element mounts, and uses `followOnAppend`. The view follows new messages only when the user is already at the bottom.
