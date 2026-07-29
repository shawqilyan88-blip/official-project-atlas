'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { type Profile, displayName, initials } from '@/core/entities';
import { LogOutIcon, SettingsIcon, UserIcon } from '@/shared/ui/icons';
import { signOutAction } from '@/modules/auth/actions';
import { routes } from '@/shared/config/routes';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui';

export function UserMenu({ profile }: { profile: Profile }) {
  const name = displayName(profile);
  const signOutForm = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Account menu for ${name}`}
        >
          <Avatar className="size-7">
            {profile.avatarUrl !== null && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[15rem]">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={routes.settings}>
            <UserIcon aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={routes.settings}>
            <SettingsIcon aria-hidden="true" />
            Workspace settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/*
          Sign-out is a form post, not a client handler: invalidating the
          session and clearing the httpOnly cookies must happen server-side.

          But a bare submit button inside a Radix menu item does NOT work: the
          click makes Radix close the menu, which unmounts this portaled form
          before the native submit fires, so the action never runs. The fix is
          to drive it through `onSelect` — `preventDefault()` keeps the menu (and
          this form) mounted, and `requestSubmit()` posts the form explicitly.
          Kept as a real <form> so it still degrades to a normal submit.
        */}
        <form ref={signOutForm} action={signOutAction}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              signOutForm.current?.requestSubmit();
            }}
          >
            <LogOutIcon aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
