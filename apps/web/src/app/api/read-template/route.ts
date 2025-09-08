import { NextResponse } from 'next/server';
import { avrTemplate } from '@/templates/avr'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get('templateId');

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
  }

  try {
    let templateContent: string | undefined;

    switch (templateId) {
      case 'avr':
        templateContent = avrTemplate;
        break;
      // Add more cases for other templates here
      default:
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Remove console.log statements as debugging is complete for path issues
    // console.log("Current Working Directory:", process.cwd());
    // console.log("Received Filepath:", templateId);
    // console.log("Absolute Path:", "N/A for direct import");

    return new NextResponse(templateContent, { status: 200, headers: { 'Content-Type': 'text/markdown' } });
  } catch (error: any) {
    console.error('Error reading template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
