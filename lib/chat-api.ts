import apiClient from "@/lib/axios";

export type ChatPage =
  | "dashboard"
  | "report"
  | "validation_result"
  | "mapping_result"
  | "comparison_result";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatContext = {
  page: ChatPage;
  project_id?: string | null;
  run_id?: string | null;
  mapping_id?: string | null;
  comparison_id?: string | null;
};

export type ChatAction = {
  type: string;
  status: string;
  href?: string | null;
  detail?: string | null;
};

export type ChatResponse = {
  reply: string;
  refused: boolean;
  page: ChatPage;
  action?: ChatAction | null;
};

export async function sendChatMessage(
  message: string,
  context: ChatContext,
  history: ChatTurn[] = [],
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    "/api/chat/",
    {
      message,
      history: history.slice(-6),
      context: {
        page: context.page,
        project_id: context.project_id || undefined,
        run_id: context.run_id || undefined,
        mapping_id: context.mapping_id || undefined,
        comparison_id: context.comparison_id || undefined,
      },
    },
    { timeout: 60_000 },
  );
  return data;
}
