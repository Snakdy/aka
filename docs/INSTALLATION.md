# Installation

## Prerequisites

* PostgreSQL database. We generally test with the latest version, however any supported version (`>=11`) should work fine.
* (*recommended*) Kubernetes. You can use any container-based solution, however we only support Kubernetes-based deployment methods
* OpenID Connect provider

## Kubernetes Secrets

You will need to create two Kubernetes secrets.

### OIDC

Create a Kubernetes secret that contains:

1. The HTTPS URL of the OIDC provider. The URL should be everything before the `/.well-known/openid-configuration` part of the discovery URL.
2. The client ID of the OIDC client.
3. The client secret of the OIDC client.

### PostgreSQL

Create a Kubernetes secret that contains the PostgreSQL DSN in any [format supported by `lib/pq`](https://pkg.go.dev/github.com/lib/pq#hdr-Connection_String_Parameters).

## Installing

Create a `values.yaml` file:

```yaml
configuration:
  externalHost: aka.example.org
  oidc:
    scopes:
      - profile
      - email
    existingSecret:
      name: oidc
      issuerKey: issuer
      clientIdKey: client_id
      clientSecretKey: client_secret
postgresql:
  existingSecret:
    # name of the secret containing the psql connection string
    name: postgres-dsn
    # field in the above secret
    key: dsn
ingress:
  enabled: true
  className: nginx
  tls:
    - secretName: tls-aka
      hosts:
        - aka.example.org
```

See the full [`values.yaml`](../charts/aka/values.yaml) for all available configuration options.

Install the Helm chart:

```shell
helm install aka oci://ghcr.io/Snakdy/aka/helm-charts/aka -f values.yaml
```
