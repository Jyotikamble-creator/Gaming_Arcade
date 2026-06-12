import { redirect } from 'next/navigation';

export default function LegacyGameRoutePage() {
  redirect('/games/reaction-time');
}
