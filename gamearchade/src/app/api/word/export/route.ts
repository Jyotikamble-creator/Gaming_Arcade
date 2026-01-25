// API Route: Export words in various formats
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { exportWords } from '@/lib/games/word';
import type { WordExportRequest } from '@/types/games/word';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const exportRequest = body as WordExportRequest;
    
    if (!exportRequest.format) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Export format is required' 
        },
        { status: 400 }
      );
    }

    // Export words using lib function
    const exportResult = await exportWords(exportRequest);

    // Set appropriate content type based on format
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      txt: 'text/plain',
      xml: 'application/xml'
    };

    const headers = {
      'Content-Type': contentTypes[exportRequest.format],
      'Content-Disposition': `attachment; filename="words_export.${exportRequest.format}"`
    };

    if (exportRequest.format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportResult,
        format: exportRequest.format,
        timestamp: new Date().toISOString()
      });
    } else {
      return new NextResponse(exportResult.data, {
        headers
      });
    }

  } catch (error: any) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') as any || 'json';
    const category = searchParams.get('category') as any;
    const difficulty = searchParams.get('difficulty') as any;
    const language = searchParams.get('language') as any || 'english';
    const includeMetadata = searchParams.get('metadata') === 'true';
    const includeExamples = searchParams.get('examples') === 'true';
    
    const exportRequest: WordExportRequest = {
      format,
      filters: {
        category,
        difficulty,
        language,
        status: 'active'
      },
      options: {
        includeMetadata,
        includeExamples,
        sortBy: 'word'
      }
    };

    // Export words
    const exportResult = await exportWords(exportRequest);

    // Set appropriate response based on format
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      txt: 'text/plain',
      xml: 'application/xml'
    };

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportResult,
        format,
        timestamp: new Date().toISOString()
      });
    } else {
      const headers = {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="words_export_${Date.now()}.${format}"`
      };

      return new NextResponse(exportResult.data, { headers });
    }

  } catch (error: any) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}