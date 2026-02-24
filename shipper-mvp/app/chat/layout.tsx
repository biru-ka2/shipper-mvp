import { SocketProvider } from "@/contexts/SocketContext";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
