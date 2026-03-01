import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code tidak ditemukan' },
        { status: 400 }
      );
    }

    // Verify state untuk CSRF protection
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    if (!state || state !== savedState) {
      return NextResponse.json(
        { message: 'State mismatch - possible CSRF attack' },
        { status: 400 }
      );
    }

    // Get user info dari cookie
    const userEmail = cookieStore.get('admin-token')?.value;
    if (!userEmail) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Create OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/oauth/callback`
    );

    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.json(
        { message: 'Gagal mendapatkan access token' },
        { status: 400 }
      );
    }

    // Set credentials untuk mendapat user info
    oauth2Client.setCredentials(tokens);

    // Get user email dari Google
    const userInfo = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });

    const googleUserEmail = (userInfo.data as any).email;

    // Update user dengan Google tokens
    await prisma.user.update({
      where: { email: googleUserEmail },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || undefined,
        googleExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      },
    });

    // Clear state cookie
    cookieStore.delete('oauth_state');

    // Redirect ke settings dengan success message
    return NextResponse.redirect(
      new URL(
        '/admin/settings?oauth=success&email=' + encodeURIComponent(googleUserEmail),
        request.url
      )
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?oauth=error&message=' + encodeURIComponent(error.message), request.url)
    );
  }
}
