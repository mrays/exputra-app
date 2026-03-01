import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          siteName: 'Website Pesan Jasa',
          siteTitle: 'Jasa Pembuatan Website Profesional',
          siteDescription: 'Layanan pembuatan website profesional untuk bisnis Anda',
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get Public Settings Error:', error);
    return NextResponse.json({ 
      siteName: 'Website Pesan Jasa',
      siteTitle: 'Jasa Pembuatan Website Profesional',
      siteDescription: 'Layanan pembuatan website profesional untuk bisnis Anda',
    });
  }
}
