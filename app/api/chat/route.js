export async function POST() {
  return new Response(JSON.stringify({ message: "API working" }), {
    headers: { "Content-Type": "application/json" }
  });
}
