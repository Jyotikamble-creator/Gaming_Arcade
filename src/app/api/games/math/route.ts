import { NextRequest, NextResponse } from 'next/server';

interface Question {
  id: number;
  q: string;
  options: string[];
  ans: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

// Generate random math questions
function generateMathQuestions(): Question[] {
  const questions: Question[] = [];
  let id = 1;

  // Addition questions
  for (let i = 0; i < 3; i++) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const correct = a + b;
    const options = [
      correct.toString(),
      (correct + Math.floor(Math.random() * 5) + 1).toString(),
      (correct - Math.floor(Math.random() * 5) - 1).toString(),
      (correct + Math.floor(Math.random() * 10) - 5).toString()
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: id++,
      q: `${a} + ${b} = ?`,
      options,
      ans: correct.toString(),
      difficulty: 'easy',
      category: 'addition'
    });
  }

  // Subtraction questions
  for (let i = 0; i < 3; i++) {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 10) + 1;
    const correct = a - b;
    const options = [
      correct.toString(),
      (correct + Math.floor(Math.random() * 5) + 1).toString(),
      (correct - Math.floor(Math.random() * 5) - 1).toString(),
      (correct + Math.floor(Math.random() * 10) - 5).toString()
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: id++,
      q: `${a} - ${b} = ?`,
      options,
      ans: correct.toString(),
      difficulty: 'easy',
      category: 'subtraction'
    });
  }

  // Multiplication questions
  for (let i = 0; i < 2; i++) {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const correct = a * b;
    const options = [
      correct.toString(),
      (correct + Math.floor(Math.random() * 10) + 1).toString(),
      (correct - Math.floor(Math.random() * 10) - 1).toString(),
      (correct + Math.floor(Math.random() * 20) - 10).toString()
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: id++,
      q: `${a} × ${b} = ?`,
      options,
      ans: correct.toString(),
      difficulty: 'medium',
      category: 'multiplication'
    });
  }

  // Division questions
  for (let i = 0; i < 2; i++) {
    const b = Math.floor(Math.random() * 10) + 2;
    const correct = Math.floor(Math.random() * 10) + 1;
    const a = b * correct;
    const options = [
      correct.toString(),
      (correct + 1).toString(),
      (correct - 1).toString(),
      (correct + 2).toString()
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: id++,
      q: `${a} ÷ ${b} = ?`,
      options,
      ans: correct.toString(),
      difficulty: 'medium',
      category: 'division'
    });
  }

  return questions.sort(() => Math.random() - 0.5);
}

export async function GET() {
  try {
    const questions = generateMathQuestions();

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total: questions.length,
        categories: ['addition', 'subtraction', 'multiplication', 'division'],
        difficulties: ['easy', 'medium']
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Generate math questions error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate math questions',
        message: error.message 
      },
      { status: 500 }
    );
  }
}