export const asToolResult = (value: Record<string, unknown>) => ({
  content: [{ text: JSON.stringify(value, null, 2), type: "text" as const }],
  structuredContent: value,
});

export const asToolError = (message: string, resolution: string) => ({
  content: [{ text: `${message} ${resolution}`, type: "text" as const }],
  isError: true,
  structuredContent: { error: message, resolution },
});
