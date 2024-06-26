export function base64Encode(input: string) {
  return btoa(
    Array.from(new TextEncoder().encode(input), b =>
      String.fromCharCode(b),
    ).join(''),
  );
}
