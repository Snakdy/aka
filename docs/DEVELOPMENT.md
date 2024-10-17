# Development

## Prerequisites

* Kubernetes development environment (we recommend Minikube)
* OIDC provider
* DNS entry for `aka.devel` (e.g., using `/etc/hosts`)

## Getting started

Create a Kubernetes secret that contains information about your OIDC provider:

```shell
kubectl create secret oidc \
    --from-literal=OIDC_ISSUER_URL=https://oidc.example.org \
    --from-literal=OIDC_CLIENT_ID=my-client-id \
    --from-literal=OIDC_CLIENT_SECRET=my-client-secret
```

Deploy the database and API:

```shell
cd aka-api/
skaffold run
```

Start the UI development server:

> Note: this is only needed if you're actively developing the UI.

```shell
cd aka-ui/
npm ci
npm run start
```

The application will now be accessible at `http://localhost:3000`

### Limitations and jank

The OIDC login flow with the UI develoment server is a bit weird.
When you log in, you will be directed to the non-development copy of the UI (`https://aka.devel`).
Simply navigate back to `http://localhost:3000` and you'll be logged in.

Depending on your OIDC provider, your login may only persist for a short period of time as the OAuth2 refresh flow doesn't _currently_ work.
