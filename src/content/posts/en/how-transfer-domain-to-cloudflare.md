---
title: "Transferring a domain to Cloudflare Registrar"
summary: "Guide to moving domain registration to Cloudflare Registrar, based on Cloudflare's documentation as of November 2026."
date: 2024-09-15
topic: cloudflare
---

The domain must be active on Cloudflare before you can enter the transfer code. DNS moves to Cloudflare first. The registration moves only after the transfer completes.

The part you do yourself takes about 30 minutes. The full process can take up to 10 days, depending on your old registrar. The steps follow [Cloudflare's official documentation](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/), last updated on 29 October 2026. The dashboard menu names may differ from those written here, so follow that documentation if your screen looks different.

## Why I use Cloudflare

I chose Cloudflare because its network is spread across many cities, including Jakarta. For a site with a small budget, its free features help. Cloudflare provides a free SSL certificate for domains that are active on it. DDoS protection is available on every plan, including the Free plan.

Cloudflare also provides performance and security features for your site.

Cloudflare Registrar doesn't add any fee on top of the registry price. You pay only the registry and ICANN fees.

## Before you start

Make sure you meet all of these requirements.

:::checklist
- Cloudflare account: an account with a verified email address and an active payment method.
- Domain age: the domain was registered at least 60 days ago, and it has not been transferred in the last 60 days.
- Owner details: the owner's name, organization, or email has not changed in the last 60 days.
- Owner email: after the transfer, the owner's email must be verified, because ICANN requires it for domains registered with Cloudflare Registrar. If it is unverified, or the verification has expired, ICANN places the domain on hold and replaces its nameservers with parking nameservers. The nameservers return after verification.
- Old registrar: your account there is still active. If the domain has already expired, renew it at the old registrar first.
- Recently expired domain: if you renewed it, wait at least 45 days after the original expiration date before you transfer. Otherwise, the registry may not add the one-year extension.
- Domain characters: only Latin letters, numbers, and hyphens. Domains with non-Latin letters are not supported.
- DNS: the domain uses Cloudflare DNS. While it is registered with Cloudflare Registrar, you cannot use another DNS provider.
:::

Cloudflare calls the 60-day rule an ICANN requirement. Under ICANN's [Transfer Policy](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy), the old registrar may refuse a transfer within 60 days of registration or of an earlier transfer.

If you transfer more than one domain, tell your bank. Each domain is charged separately. Back-to-back charges can trigger a fraud alert.

.us domains have extra requirements. See [requirements for .us domains](https://developers.cloudflare.com/registrar/top-level-domains/us-domains/).

Not every domain extension can be transferred. Cloudflare Registrar supports more than 400 TLDs, and the full list is on the [TLD policies page](https://www.cloudflare.com/tld-policies/). As of 14 November 2026, that list doesn't include .id. Domains ending in .com, .net, and .org are supported.

## Step 1: Add the domain to Cloudflare

The domain must be active on Cloudflare before the transfer starts. Without that status, the authorization code field cannot be used.

### Turn off DNSSEC at the old registrar

DNSSEC signatures are tied to the old DNS provider. After the nameservers move to Cloudflare, those signatures no longer match. As a result, DNS resolution can fail, and the domain cannot become active.

Follow these steps at the old registrar:

1. Find the DNSSEC or DS record settings. If there are none, skip this step.
2. Delete or disable DNSSEC. The option is sometimes called "DS records".
3. Wait at least 24 hours before you change the nameservers.

DNSSEC that is still active can also block the registration transfer.

### Add the domain and change the nameservers

In the Cloudflare dashboard, add your domain. Follow the [Cloudflare DNS setup guide](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) to review your DNS records. Cloudflare can scan your DNS records automatically, but the scan isn't guaranteed to find all of them. Also check the records for your web host or email service before you change the nameservers.

Then change the nameservers at the old registrar to the ones Cloudflare gives you. How you change nameservers differs at each registrar. The instructions are in the [Cloudflare nameserver documentation](https://developers.cloudflare.com/dns/nameservers/update-nameservers/).

### Wait for the domain to become active

In the Cloudflare dashboard, the domain status changes from Pending to Active. This usually takes a few minutes, but it can take up to 24 hours. If the status is still Pending after 24 hours, check the nameservers at the old registrar again. Confirm that DNSSEC is also off.

Check the nameservers with this command. Replace `example.com` with your domain:

```sh
dig ns example.com @1.1.1.1
```

If the nameservers that appear match the ones Cloudflare gave you, the change has propagated. If you do not have `dig`, use `nslookup -type=ns example.com 1.1.1.1` instead.

## Step 2: Transfer the registration

This process goes back and forth between the old registrar and Cloudflare. You unlock the domain, get the code, and then approve the transfer at the old registrar.

### Unlock the domain

At the old registrar, turn off the registrar lock. It is also called the domain lock or transfer lock. In WHOIS, this lock appears as `clientTransferProhibited`.

Some registrars have several locks, such as a domain lock and a privacy lock. Turn off all of them. If the domain is still locked, check other settings.

### Request the authorization code

At the old registrar, request the authorization code. It is also called the auth code, EPP code, authinfo code, or transfer code. Cloudflare uses it to confirm that the domain owner approves the transfer.

The code is usually valid only for a short time, so request it when you are ready to enter it. If the registrar does not give you a way to generate the code yourself, it must provide the code within 5 calendar days after you request it. The rule is in section 5.2 of the [ICANN Transfer Policy](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy).

Each registrar has its own menu. At Hostinger, for example, the code is in the Domain Overview section. See [Hostinger's EPP code guide](https://www.hostinger.com/support/1583203-how-to-get-the-epp-code-at-hostinger/).

### Enter the code in Cloudflare

In the Cloudflare dashboard, open the Transfer domains page. Select the domain, then enter the authorization code.

For most generic domains, such as .com, .net, and .org, the transfer already includes a one-year extension. That extension is counted from the current expiration date. This rule comes from ICANN for gTLD transfers.

Country-code domains such as .uk have their own rules. For .uk, the transfer does not add a year and has no transfer fee.

Make sure your payment method is valid before you submit the code. If a payment fails after the code is sent, the transfer can stop partway through.

Fill in the contact information, then select Confirm transfer to accept the terms of service. Cloudflare hides this data from public WHOIS by default. ICANN still requires accurate data. Wrong data can cause the domain to be suspended.

For .ca, .mx, and .nz domains, you may receive a separate email to verify your contact details after the transfer completes. If you do not finish the verification in time, the domain can be suspended.

### Approve at the old registrar

After you submit, Cloudflare processes the request. Cloudflare also sends a Form of Authorization (FOA) email to the domain owner. This email is sent when the owner's details are available in public WHOIS. The old registrar also sends a confirmation email.

Approve it through the email or the old registrar's dashboard. Most registrars process the request within 5 business days. For .mx, it can take up to 10 business days.

Check the status on the Transfer domains page:

- Transfer in progress: Cloudflare has sent the request to the old registrar. If this status lasts longer than 24 hours, make sure the domain is no longer locked.
- Pending approval: the old registrar has received the request and may need up to 5 days to release the domain. Approve it through the email or dashboard to speed things up.
- Transfer rejected: the old registrar rejected the request. Select Retry to send a new request.

## If the domain is at Shopify or Block

Platforms such as Shopify and Block often also act as registrars. These platforms usually do not allow nameserver changes. In that case, a direct transfer to Cloudflare is not possible.

You need to move the domain twice:

1. Get the transfer code from your platform, then transfer the domain to another registrar that allows nameserver changes. This usually takes 3 to 5 days.
2. Change the nameservers to Cloudflare. You can use Cloudflare's CDN, DNS, and security features right after this step.
3. After 60 days, transfer the registration to Cloudflare from the Transfer domains page.

Each transfer adds one year to the registration. You pay the other registrar for the first transfer, and Cloudflare for the second. If you only want Cloudflare DNS and features, you can stop once the nameservers are changed.

## After the transfer

Manage your transferred domains on the Manage domains page.

### Turn DNSSEC back on

You can turn DNSSEC back on in Cloudflare with one click, and the feature is free. Open Manage domains, select the domain, then select Configuration > Enable DNSSEC. After you enable it, the process can take one to two days. Don't assume something has failed right away.

### Check renewal

Auto-renew is on by default. Cloudflare tries to renew the domain about 30 days before it expires, at the official registry price. If you don't want to renew, turn off auto-renew at least 30 days before the expiration date. Paid renewals cannot be refunded.

### Personal data in WHOIS

For domains registered with Cloudflare Registrar, the owner's name, email, and address don't appear in public WHOIS. This feature is free. The country and state or province stay visible because of ICANN rules.

First published on September 15, 2024. Updated on November 14, 2026.
