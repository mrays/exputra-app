import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret } = await request.json();

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: 'Client ID dan Secret wajib diisi' },
        { status: 400 }
      );
    }

    // Create OAuth2 client dengan credentials yang diberikan
    const oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/oauth/callback`
    );

    // Generate state untuk CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Save state ke cookie
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Get authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
    });

    return NextResponse.json({
      authUrl,
      message: 'Redirect ke Google untuk autentikasi',
    });
  } catch (error: any) {
    console.error('OAuth initiate error:', error);
    return NextResponse.json(
      { message: 'Gagal memulai OAuth: ' + error.message },
      { status: 500 }
    );
  }
}
