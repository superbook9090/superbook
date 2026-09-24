export async function fetchDailyQuizCounter(): Promise<number> {
  try {
    const notesRes = await fetch('/api/notes');
    if (!notesRes.ok) return 1;

    const { notes } = await notesRes.json();
    const counterNote = notes?.find(
      (n: { title: string; _id: string; content: string }) => n.title === 'Daily Quiz Counter'
    );

    if (counterNote) {
      let contestNumber = parseInt(counterNote.content, 10) + 1;
      if (isNaN(contestNumber)) contestNumber = 1;

      await fetch(`/api/notes/${counterNote._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contestNumber.toString() }),
      });
      return contestNumber;
    }

    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Daily Quiz Counter',
        content: '1',
      }),
    });
    return 1;
  } catch {
    return Math.floor(Math.random() * 10000) + 1;
  }
}

export function toLocalDateTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
