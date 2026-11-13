---
title: "Internet: from IP addresses to HTTPS"
summary: "A short explanation of IP, DNS, TCP, HTTP, and TLS that you need to know when building web apps."
date: 2024-09-10
topic: networking
---

A network is a group of connected computers and devices. Your home can have its own network, and so can your neighbor. When those networks connect, they form the internet.

## What is the internet

The internet started with ARPANET, a research network funded by ARPA (now DARPA) under the United States Department of Defense. ARPANET first connected in September 1969. On January 1, 1983, ARPANET switched from its old protocol, NCP, to TCP/IP.

According to the [ITU's 2026 report](https://www.itu.int/itu-d/reports/statistics/facts-figures-2026/), about 6.3 billion people, or 76%, used the internet in 2026. Even so, 2 billion people are still not connected.

## How the internet works

Devices exchange data through protocols. A protocol is a standard set of rules for how data is sent and received. Because the rules are the same, devices from different makers can talk to each other.

The sender breaks data into small packets. Each router forwards every packet to the next router until the packet reaches its destination.

These are the protocols you meet most often when you build web apps:

- IP (Internet Protocol): routes packets to their destination address.
- TCP (Transmission Control Protocol) and UDP (User Datagram Protocol): control how packets are sent between two devices.
- DNS (Domain Name System): translates domain names into IP addresses and other data.
- HTTP (Hypertext Transfer Protocol): controls how data is exchanged between the browser and the server.
- TLS (Transport Layer Security): secures the connection. SSL (Secure Sockets Layer) is its predecessor and must no longer be used.

## IP addresses and domain names

Every device on a network has an IP address. IPv4 addresses use 32 bits. IPv6 uses 128 bits, so its address space is much larger.

Domain names such as `google.com` are easier to remember than IP addresses. DNS stores data for each domain name. What people look up most often is the IP address.

When you open a site by its domain name, your device asks a recursive DNS resolver for the IP address. The resolver keeps searching until it gets an answer. It keeps the result in a cache for a short time, so the next lookup is faster.

## TCP, UDP, and ports

TCP gives a reliable, ordered stream of data. It uses sequence numbers to detect lost packets and a checksum to detect errors. TCP resends data that goes missing.

UDP does not guarantee delivery, and it does not stop duplicate packets. DNS uses UDP port 53 for short queries and answers, and TCP port 53 for longer answers. HTTP/3 also runs on UDP, through QUIC, as defined in the [HTTP/3 specification (RFC 9114)](https://www.rfc-editor.org/rfc/rfc9114.txt).

A port identifies a service or application on a device. Ports use 16 bits, from 0 to 65,535. IANA (Internet Assigned Numbers Authority) splits the port range into three, as set out in the [port management rules in RFC 6335](https://www.rfc-editor.org/rfc/rfc6335.txt):

- 0 to 1,023 for system services
- 1,024 to 49,151 for user ports (registered with IANA)
- 49,152 to 65,535 for dynamic ports

A socket combines an IP address and a port. Two sockets form one TCP connection, one at each end.

## HTTP and HTTPS

HTTP defines how a browser requests data and how a server responds. HTTPS is HTTP encrypted with TLS.

In July 2018, [Chrome began marking HTTP pages](https://blog.google/products-and-platforms/products/chrome/milestone-chrome-security-marking-http-not-secure/) as "Not secure". In September 2023, Chrome 117 on desktop [replaced the padlock icon](https://blog.chromium.org/2023/05/an-update-on-lock-icon.html) in the address bar with a "tune" icon that opens the site settings. In October 2025, [Google announced](https://blog.google/security/https-by-defau/) that Chrome would ask for permission before opening public sites without HTTPS. According to the [Chrome release notes](https://developer.chrome.com/release-notes/154), the stable version with this change shipped on September 22, 2026. In that version, Chrome asks for permission by default when you open a site over an HTTP connection.

HTTP/2 was standardized in May 2015 as RFC 7540. RFC 9113 replaced it in June 2022. HTTP/2 sends several requests at once over one TCP connection, and it compresses headers too. However, head-of-line blocking at the TCP level still exists.

HTTP/3 was standardized in June 2022. Each stream in QUIC runs independently, so a lost packet only holds up the streams whose data was in that packet. QUIC uses [TLS 1.3 (RFC 8446)](https://www.rfc-editor.org/rfc/rfc8446.txt) to secure its connections.

## TLS and certificates

TLS is designed to prevent eavesdropping, tampering, and message forgery. A TLS connection starts with a handshake. Both sides agree on a protocol version and algorithms, then create a shared key. After that, data is sent encrypted.

A certificate proves the identity of the server. The browser checks the certificate through trusted certificate authorities.

TLS 1.3 was standardized in August 2018. TLS 1.0 and TLS 1.1 must no longer be used, as the [deprecation document for TLS 1.0 and 1.1 (RFC 8996)](https://www.rfc-editor.org/rfc/rfc8996.txt) sets out. For servers, disable SSL, TLS 1.0, and TLS 1.1, then install a valid certificate.

## What is Web3

According to the [Web3 page on ethereum.org](https://ethereum.org/web3/), Web3 is an umbrella term for a new and better vision of the internet. In short, Web3 uses blockchain, cryptocurrency, and NFTs to return power to users through ownership. The same page says that many parts of the internet are now controlled and owned by centralized entities. In Web3, ownership is spread among builders and users. Gavin Wood, one of the founders of Ethereum, introduced the term in 2014.

First published on September 10, 2024. Updated on November 14, 2026.
