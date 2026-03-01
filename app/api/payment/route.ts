import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import prisma from '@/lib/prisma';

const DUITKU_API_URL = process.env.DUITKU_BASE_URL ? `${process.env.DUITKU_BASE_URL}/api/merchant/v2/inquiry` : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';
const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE || 'D9808';
const API_KEY = process.env.DUITKU_API_KEY || '9329b1b8af27f2d3f9330075391fc250';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      productDetails,
      paymentMethod,
      orderData
    } = body;

    const signature = createHash('md5')
      .update(MERCHANT_CODE + orderId + amount + API_KEY)
      .digest('hex');

    const payload = {
      merchantCode: MERCHANT_CODE,
      paymentAmount: amount,
      paymentMethod: paymentMethod,
      merchantOrderId: orderId,
      productDetails: productDetails || 'Website Package',
      customerVaName: customerName,
      email: customerEmail,
      phoneNumber: customerPhone,
      itemDetails: [
        {
          name: productDetails || 'Website Package',
          price: amount,
          quantity: 1
        }
      ],
      customerDetail: {
        firstName: customerName?.split(' ')[0] || 'Customer',
        lastName: customerName?.split(' ').slice(1).join(' ') || '',
        email: customerEmail,
        phoneNumber: customerPhone
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/payment/success`,
      signature: signature,
      expiryPeriod: 60
    };

    console.log('Duitku API Request:', {
      url: DUITKU_API_URL,
      merchantCode: MERCHANT_CODE,
      orderId,
      amount,
      paymentMethod,
      signatureInput: `${MERCHANT_CODE}${orderId}${amount}${API_KEY.substring(0, 8)}...`,
      signature: signature.substring(0, 20) + '...'
    });

    const response = await fetch(DUITKU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Duitku API Response Status:', response.status);
    console.log('Duitku API Raw Response:', responseText);

    if (response.status === 401 || responseText === 'Unauthorized') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Periksa Merchant Code dan API Key'
      }, { status: 401 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Duitku response:', responseText);
      return NextResponse.json({
        success: false,
        error: 'Invalid response from payment gateway: ' + responseText
      }, { status: 500 });
    }

    console.log('Duitku API Parsed Response:', data);

    if (data.statusCode === '00' || data.paymentUrl) {
      // Save order to database
      console.log('Order Data received:', orderData);

      if (orderData && orderData.domainId && orderData.templateId && orderData.packageId) {
        try {
          // Check if order already exists
          const existingOrder = await prisma.order.findUnique({
            where: { invoiceId: orderId }
          });

          if (!existingOrder) {
            console.log('Saving new order to database:', orderId);
            await prisma.order.create({
              data: {
                invoiceId: orderId,
                domainName: orderData.domainName,
                domainId: orderData.domainId,
                templateId: orderData.templateId,
                packageId: orderData.packageId,
                promoId: orderData.promoId || null,
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                subtotal: orderData.subtotal,
                discount: orderData.discount || 0,
                total: amount,
                paymentMethod: paymentMethod,
                paymentRef: data.reference,
                status: 'PENDING',
                services: orderData.services?.length > 0 ? {
                  create: orderData.services.map((service: { id: string; price: number }) => ({
                    serviceId: service.id,
                    price: service.price,
                  })),
                } : undefined,
              },
            });
            console.log('New order saved:', orderId);
          } else {
            console.log('Order already exists, updating payment ref:', orderId);
            await prisma.order.update({
              where: { invoiceId: orderId },
              data: {
                paymentMethod: paymentMethod,
                paymentRef: data.reference,
              }
            });
          }
        } catch (dbError) {
          console.error('Failed to save/update order:', dbError);
        }
      } else {
        console.error('Missing required order data:', {
          hasOrderData: !!orderData,
          domainId: orderData?.domainId,
          templateId: orderData?.templateId,
          packageId: orderData?.packageId,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: data.paymentUrl,
          reference: data.reference,
          vaNumber: data.vaNumber,
          amount: data.amount,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.statusMessage || data.Message || 'Payment creation failed',
        details: data
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
