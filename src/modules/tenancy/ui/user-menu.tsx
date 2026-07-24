'use client';

import Link from 'next/link';

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
          A form post rather than a click handler: signing out must invalidate
          the session server-side and clear httpOnly cookies, neither of which
          client JavaScript can do.
        */}
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOutIcon aria-hidden="true" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
