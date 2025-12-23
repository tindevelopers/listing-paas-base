import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS Platform - Consumer Portal",
  description: "Consumer-facing portal for SaaS platform",
};

/**
 * Root Layout for Consumer Portal
 * 
 * CUSTOMIZE: Update the ChatWidget props for your platform branding.
 * Set OPENAI_API_KEY environment variable to enable AI chat.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only show chat widget if AI is configured
  const showChat = !!process.env.OPENAI_API_KEY;

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* CUSTOMIZE: Update chat widget styling and messages */}
        {showChat && (
          <ChatWidget
            position="bottom-right"
            primaryColor="#3b82f6"
            title="Need help?"
            welcomeMessage="Hi! I'm here to help you find what you're looking for. Ask me anything about our listings!"
            placeholder="Type your question..."
          />
        )}
      </body>
    </html>
  );
}

