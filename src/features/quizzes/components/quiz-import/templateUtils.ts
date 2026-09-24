export async function downloadQuizTemplate(): Promise<void> {
  const XLSX = await import('xlsx');
  const template = [
    ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'],
    ['What is 2+2?', '3', '4', '5', '6', 'B'],
    ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'],
    ['Which planet is closest to the Sun?', 'Venus', 'Earth', 'Mercury', 'Mars', 'C'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
  XLSX.writeFile(wb, 'quiz_template.xlsx');
}
