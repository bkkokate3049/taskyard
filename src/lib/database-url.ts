export function withVerifiedSsl(url: string): string {
  return url.replace(
    /([?&]sslmode=)(?:require|prefer|verify-ca)(?=&|$)/,
    "$1verify-full",
  );
}
