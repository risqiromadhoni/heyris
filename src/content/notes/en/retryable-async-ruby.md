---
title: "Retry waits in retryable-async do not block other Async tasks"
summary: "retryable-async waits with a plain sleep, and inside an Async task that wait only pauses the retrying task."
date: 2026-11-14
topic: ruby
icon: arrows-clockwise
label: "Retry in Async"
tags: ["Ruby", "Async"]
tldr: "Inside an Async task, a retry wait only pauses the retrying task. The gem waits with a plain sleep."
---

I wrote retryable-async, a small Ruby gem that retries a block of code when it fails. You can use it inside an Async task.

## What the gem adds

By default, `Retryable::Async.run` tries the block up to three times. The wait between attempts grows linearly: 1 second, then 2 seconds. If the third attempt also fails, `run` raises the error again.

You can change this behavior with these options:

- `max_attempts` sets the number of attempts.
- `on` selects the exceptions to retry. By default, it covers every `StandardError`.
- `base_delay` and `backoff` set the delay. `backoff` is `:linear` or `:exponential`.
- `jitter` multiplies the delay by a random factor between 0.5 and 1.5.
- `before_retry` receives the number of the failed attempt and its exception, before each retry.

## Example from the README

The gem does not depend on async, so you require `async` yourself.

```ruby
require 'async'
require 'retryable-async'

Async do
  Retryable::Async.run do
    puts "Doing something asynchronously..."
    raise "fail"
  end
end
```

The block in this example always fails, so there are two waits: 1 second before the second attempt and 2 seconds before the third. After that, `Retryable::Async.run` raises the error again.

## The retry wait does not block other tasks

This section applies to async 2.46.0, which requires Ruby 3.3 or later.

Async runs each task on a fiber. Each retry wait calls a plain `sleep`. Inside an Async task, Ruby passes that `sleep` to the Async scheduler.

The scheduler only pauses the fiber that calls `sleep`. Other Async tasks can keep running during the retry wait.
