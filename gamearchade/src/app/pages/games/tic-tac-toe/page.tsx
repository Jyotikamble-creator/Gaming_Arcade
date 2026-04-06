import { redirect } from 'next/navigation';

export default function LegacyGameRoutePage() {
  redirect('/games/tic-tac-toe');
}
