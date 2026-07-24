/**
 * Typed contract for the `public` schema.
 *
 * This file mirrors `supabase/migrations/` exactly and is the single source of
 * type truth for every query in the application. Do not hand-edit it after a
 * schema change — regenerate it so drift is impossible:
 *
 *     npm run db:types
 *
 * (Equivalent to `supabase gen types typescript --linked --schema public`.)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: Database['public']['Enums']['app_role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role?: Database['public']['Enums']['app_role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          role?: Database['public']['Enums']['app_role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memberships_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_organization_with_owner: {
        Args: { organization_name: string; organization_slug: string };
        Returns: Database['public']['Tables']['organizations']['Row'];
      };
      is_organization_slug_available: {
        Args: { candidate_slug: string };
        Returns: boolean;
      };
      is_org_member: {
        Args: { target_organization: string };
        Returns: boolean;
      };
      org_role: {
        Args: { target_organization: string };
        Returns: Database['public']['Enums']['app_role'];
      };
      has_org_role: {
        Args: {
          target_organization: string;
          minimum_role: Database['public']['Enums']['app_role'];
        };
        Returns: boolean;
      };
      shares_organization_with: {
        Args: { target_user: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'member' | 'admin' | 'owner';
    };
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row'];

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];

export type ProfileRow = Tables<'profiles'>;
export type OrganizationRow = Tables<'organizations'>;
export type MembershipRow = Tables<'memberships'>;
