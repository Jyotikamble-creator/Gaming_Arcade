/**
 * PostgreSQL Word model using Prisma
 * Provides database operations for word management
 */

import { prisma } from '@/lib/mongodb';
import type { Word } from '@prisma/client';

export interface IWord extends Word {}

/**
 * Create a new word
 */
export async function createWord(data: {
  word: string;
  category: string;
  difficulty: string;
  language: string;
  description: string;
  definition?: string;
  pronunciation?: string;
  etymology?: string;
  examples?: string[];
  hints?: string[];
  frequency?: number;
}) {
  return prisma.word.create({
    data: {
      word: data.word.toUpperCase(),
      category: data.category || 'General',
      difficulty: data.difficulty || 'beginner',
      language: data.language || 'english',
      description: data.description,
      definition: data.definition,
      pronunciation: data.pronunciation,
      etymology: data.etymology,
      examples: data.examples || [],
      hints: data.hints || [],
      frequency: data.frequency ?? 50,
      status: 'active',
      verifiedAt: new Date(),
    },
  });
}

/**
 * Find word by text
 */
export async function findWordByText(word: string) {
  return prisma.word.findUnique({
    where: { word: word.toUpperCase() },
  });
}

/**
 * Get random word by difficulty
 */
export async function getRandomWordByDifficulty(difficulty: string, category?: string) {
  const where: any = {
    difficulty,
    status: 'active',
  };
  
  if (category) {
    where.category = category;
  }

  const count = await prisma.word.count({ where });
  
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  
  return prisma.word.findFirst({
    where,
    skip,
  });
}

/**
 * Get multiple random words
 */
export async function getRandomWords(count: number, difficulty?: string, category?: string) {
  const where: any = {
    status: 'active',
  };
  
  if (difficulty) {
    where.difficulty = difficulty;
  }
  
  if (category) {
    where.category = category;
  }

  return prisma.word.findMany({
    where,
    take: count,
    skip: Math.floor(Math.random() * 100),
  });
}

/**
 * Search words by category
 */
export async function searchWordsByCategory(category: string, limit: number = 20) {
  return prisma.word.findMany({
    where: {
      category,
      status: 'active',
    },
    take: limit,
  });
}

/**
 * Get all words with filters
 */
export async function getAllWords(filters?: {
  difficulty?: string;
  category?: string;
  language?: string;
  limit?: number;
}) {
  const where: any = {
    status: 'active',
  };

  if (filters?.difficulty) where.difficulty = filters.difficulty;
  if (filters?.category) where.category = filters.category;
  if (filters?.language) where.language = filters.language;

  return prisma.word.findMany({
    where,
    take: filters?.limit || 100,
  });
}

/**
 * Update word usage
 */
export async function updateWordUsage(wordId: string) {
  return prisma.word.update({
    where: { id: wordId },
    data: {
      usageCount: { increment: 1 },
      lastUsed: new Date(),
    },
  });
}

/**
 * Delete word
 */
export async function deleteWord(wordId: string) {
  return prisma.word.delete({
    where: { id: wordId },
  });
}

/**
 * Get word statistics
 */
export async function getWordStats() {
  const [total, byDifficulty, byCategory] = await Promise.all([
    prisma.word.count({ where: { status: 'active' } }),
    prisma.word.groupBy({
      by: ['difficulty'],
      where: { status: 'active' },
      _count: true,
    }),
    prisma.word.groupBy({
      by: ['category'],
      where: { status: 'active' },
      _count: true,
    }),
  ]);

  return {
    total,
    byDifficulty,
    byCategory,
  };
}

export default {
  createWord,
  findWordByText,
  getRandomWordByDifficulty,
  getRandomWords,
  searchWordsByCategory,
  getAllWords,
  updateWordUsage,
  deleteWord,
  getWordStats,
};
