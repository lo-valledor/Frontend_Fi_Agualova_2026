# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within ENERLOVA, please follow these steps:

1. **Do NOT** open a public issue
2. Send an email to the security team at: [security@enerlova.com]
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Within 30 days (depending on severity)

## Security Measures

This project implements the following security practices:

### Static Analysis (SAST)
- **SonarQube**: Automated code analysis on every PR
- **ESLint**: Security-focused linting rules
- **TypeScript**: Type safety to prevent common vulnerabilities

### Dynamic Analysis (DAST)
- **OWASP ZAP**: Automated security scanning
  - Baseline scans on Pull Requests
  - Full scans weekly

### Dependency Management (SCA)
- **Dependabot**: Automated dependency updates
- **npm audit**: Vulnerability scanning in CI/CD

### Security Headers
All responses include the following security headers (configured in nginx):
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

## Security Contacts

- Security Lead: [@gbourguett](https://github.com/gbourguett)

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve our security.
