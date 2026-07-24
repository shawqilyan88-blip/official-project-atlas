import type { Metadata } from 'next';
import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Wordmark,
} from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Sign-in link problem',
  robots: { index: false, follow: false },
};

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params['reason'];
  const reason = typeof raw === 'string' ? raw : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle>That link did not work</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Confirmation links can only be used once, and they expire after 24 hours.
            Requesting a new one will get you in.
          </p>

          {/*
            Rendered as text, never as markup: this string comes from a query
            parameter, and interpolating it into HTML would be a reflected XSS.
            React escapes it for us — the point is that it must stay text.
          */}
          {reason !== null && <Alert tone="error">{reason}</Alert>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild block>
              <Link href={routes.signIn}>Back to sign in</Link>
            </Button>
            <Button asChild variant="outline" block>
              <Link href={routes.signUp}>Create an account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
