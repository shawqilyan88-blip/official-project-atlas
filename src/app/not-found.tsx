import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { Button, Card, CardContent, CardHeader, CardTitle, Wordmark } from '@/shared/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            That page does not exist, or you may not have access to it.
          </p>
          <Button asChild block>
            <Link href={routes.home}>Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
