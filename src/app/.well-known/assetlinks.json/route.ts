import { NextResponse } from 'next/server';

export async function GET() {
  const assetLinks = [
    {
      "relation": [
        "delegate_permission/common.handle_all_urls",
        "delegate_permission/common.get_login_creds"
      ],
      "target": {
        "namespace": "android_app",
        "package_name": "com.quizdo",
        "sha256_cert_fingerprints": [
          "B7:92:CE:54:F1:E8:1E:AD:3A:85:FC:F7:1F:DD:53:F6:34:AD:16:FF:65:8C:50:FD:3A:E2:DB:C1:12:D6:5F:A1"
        ]
      }
    }
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
