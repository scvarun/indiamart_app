import AuthGuard from "@/components/AuthGuard";
import ChatsComp from '@/components/Chats/Chats';

export default function Chats() {
  return (
    <AuthGuard>
      <ChatsComp />
    </AuthGuard>
  );
}
