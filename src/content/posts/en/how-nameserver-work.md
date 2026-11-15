---
title: "How nameservers work: from domain name to IP address"
summary: "A DNS lookup passes through a resolver, root servers, TLD servers, and then authoritative nameservers until it gets an IP address."
date: 2024-09-12
updated: 2026-11-14
topic: networking
---

When you open `www.example.com` in a browser, your device does not yet know the site's IP address. The domain name has to be turned into an IP address first. This process is called DNS (Domain Name System) resolution. A nameserver is the server that carries it out.

The word nameserver covers two different roles. A recursive resolver looks up answers for your device. An authoritative nameserver stores the official data for that domain.

## Steps when you open a site

A DNS lookup that is not in the cache usually passes through four kinds of servers.

### Check the cache on the device

Browsers and operating systems usually store DNS lookup results for a short time. If the IP address is already in the cache, the device uses it directly. While the cached entry is still valid, no new request goes to a server.

If the cache has no answer, the request goes to the stub resolver. The stub resolver is a simple part of the operating system that cannot search on its own. It passes the request on to a recursive resolver.

### The recursive resolver receives the request

The recursive resolver looks up the answer on behalf of your device. This resolver usually comes from your ISP, or from a public DNS service such as `1.1.1.1` from Cloudflare or `8.8.8.8` from Google. If the resolver already has the answer in its cache, it replies right away. If not, it starts by asking a root server.

### Root servers point to TLD servers

There are 13 root server names, from `a.root-servers.net` to `m.root-servers.net`. Those 13 names are backed by many servers in different countries. You can see where they are on [the root server map](https://root-servers.org/). A root server does not store the IP address of a site. It only points to the TLD (top-level domain) server that matches the domain extension, such as .com.

### TLD servers point to authoritative nameservers

A TLD server stores the list of nameservers for every domain that uses the same extension, such as .com. For example.com, the .com server replies with the list of nameservers for that domain. A TLD server does not store the IP address of that site.

### Authoritative nameservers return the IP address

An authoritative nameserver stores the official records for that domain. It replies with an A record, which is the site's IPv4 address. If the name you looked up is an alias (CNAME), the resolver repeats the lookup for the alias's target name. The resolver then sends the IP address to your device, and the browser uses it to connect to the web server.

## Common DNS record types

An authoritative nameserver stores DNS records. A resolver keeps only temporary copies. These are the record types used most often:

- `A`: IPv4 address for a domain name
- `AAAA`: IPv6 address for a domain name
- `CNAME`: an alias that points to another name, and holds no IP address
- `MX`: the mail server that receives email for that domain
- `TXT`: plain text, often used to verify domain ownership and for email security
- `NS`: the nameservers responsible for that domain

## TTL and why DNS changes take time

TTL (time to live) is the time limit, in seconds, for how long a record may be kept in a cache. [RFC 2181, Clarifications to the DNS Specification](https://www.rfc-editor.org/rfc/rfc2181) states that the TTL is a maximum, not a required wait time. A resolver may keep a record for less time, and may cap a TTL that is too large.

What people call DNS propagation is really cache entries in many resolvers expiring at different times. A resolver that already holds an old answer keeps using it until the TTL runs out. Then it asks the authoritative nameserver again.

### Changing record contents

If you change an IP address or a CNAME value, wait until the old TTL runs out. Changing the TTL at the same time does not help, because caches that already exist keep using the old TTL. For a planned migration, lower the TTL first. [Cloudflare's guide to preparing a DNS migration](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/) suggests a lead time of at least 24 to 48 hours, or longer, before the migration starts. Ideally, that lead time matches the longest TTL currently in use. The same guide also gives 300 seconds (5 minutes) as a common short TTL for migrations.

### Changing nameservers at the registrar

Changing nameservers at the registrar changes the delegation in the TLD servers, not the contents of the domain's zone. For example.com, the .com server gives the domain's nameserver list a TTL of 172,800 seconds (48 hours). Cloudflare suggests that you wait up to 24 hours while your registrar updates your nameservers. How long you wait depends on that TTL and on the registrar's process.

The registrar's panel only shows what you requested. To see what the TLD servers have published, use `dig`, as shown at the end of this article.

### If the domain uses DNSSEC

DNSSEC adds cryptographic signatures to DNS records. The signatures help resolvers confirm that the data came from the zone owner and was not changed along the way. Changing nameservers while DNSSEC is still active can make the domain unreachable. So turn DNSSEC off at the registrar by deleting the DS record first. Then wait until the DS record's TTL expires at the TLD servers, and only after that change the nameservers. [Cloudflare's guide to preparing a DNS migration](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/) advises waiting at least that long, and preferably up to 1.5 times that TTL. A typical DS record TTL is 86,400 seconds (24 hours).

## Multiple nameservers for one domain

The DNS specification and domain registration rules require at least two servers for every zone. [RFC 2182, Selection and Operation of Secondary DNS Servers](https://www.rfc-editor.org/rfc/rfc2182) covers how to choose and manage those servers. The RFC also recommends more than two. If one of two servers is unavailable, only one active server is left for the zone.

The terms primary and secondary are often misread as a main server and a backup server. Both actually describe where a copy of the zone data comes from, through a zone transfer. For resolvers, all registered nameservers are equal. Resolvers often measure how each server performs, and they use the best-performing server more often. If one server does not answer, the resolver tries another.

## Check it yourself with dig

Replace `example.com` with your own domain. The `dig` command is available on macOS. On Linux, `dig` usually comes in the BIND package, for example `bind9-dnsutils` on Ubuntu. On Windows, use `nslookup`, for example `nslookup -type=ns example.com 1.1.1.1`.

Start with the domain's nameservers:

```bash
dig +short NS example.com
```

This command follows the path from a root server to the A record:

```bash
dig +trace example.com
```

Each block of output comes from one step in the lookup. The last block contains the A record.

The second number on each record line is the TTL in seconds. Run this command against a public resolver, then run it again a few seconds later:

```bash
dig @1.1.1.1 example.com A +noall +answer
```

The TTL usually goes down, because the resolver counts down the time left in its cache.

To see the answer directly from an authoritative nameserver, ask that nameserver. The answer does not come from a resolver's cache. Replace `elliott.ns.cloudflare.com` with one of the nameservers from the first command:

```bash
dig @elliott.ns.cloudflare.com example.com A +noall +answer
```

After you change nameservers at the registrar, check what the TLD servers have published:

```bash
dig +trace example.com NS +noall +authority +nodnssec
```

If the result still shows the old nameservers, the registrar change has not reached the TLD servers yet. Wait, then check again.
