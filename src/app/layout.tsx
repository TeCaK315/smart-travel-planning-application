import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Smart Travel Planning Application Dashboard',
  description: 'Дашборд для мониторинга Пользователи испытывают трудности с планированием путешествий, используя множество приложений и инструментов, что приводит к путанице и потере времени.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
