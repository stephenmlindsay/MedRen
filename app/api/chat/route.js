export async function POST(req) {
  const { messages } = await req.json();
  const lastUser = [...(messages ?? [])].reverse().find((m) => m?.role === "user");

  return Response.json({
    message: {
      role: "assistant",
      content: lastUser
        ? `Echo: ${lastUser.content}`
        : "Hello—send me a message to begin."
    }
  });
}
