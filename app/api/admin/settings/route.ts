import { NextRequest, NextResponse } from 'next/server';
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
    console.error('Get Settings Error:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    let settings = await prisma.siteSetting.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: body,
      });
    } else {
      settings = await prisma.siteSetting.update({
        where: { id: settings.id },
        data: {
          siteName: body.siteName,
          siteTitle: body.siteTitle,
          siteDescription: body.siteDescription,
          favicon: body.favicon,
          logo: body.logo,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          contactAddress: body.contactAddress,
          socialFacebook: body.socialFacebook,
          socialInstagram: body.socialInstagram,
          socialTwitter: body.socialTwitter,
          socialWhatsapp: body.socialWhatsapp,
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update Settings Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
