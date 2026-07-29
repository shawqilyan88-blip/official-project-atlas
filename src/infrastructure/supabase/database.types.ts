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
      trade_profiles: {
        Row: {
          id: string;
          organization_id: string;
          products: string[];
          industry: string | null;
          roles: Database['public']['Enums']['trade_role'][];
          looking_for: Database['public']['Enums']['trade_looking_for'] | null;
          countries: string[];
          production_capacity: string | null;
          moq: string | null;
          certifications: string[];
          languages: string[];
          business_types: string[];
          company_size: string | null;
          incoterms: string[];
          payment_terms: string[];
          currencies: string[];
          website: string | null;
          description: string | null;
          completed_at: string | null;
          skipped_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          products?: string[];
          industry?: string | null;
          roles?: Database['public']['Enums']['trade_role'][];
          looking_for?: Database['public']['Enums']['trade_looking_for'] | null;
          countries?: string[];
          production_capacity?: string | null;
          moq?: string | null;
          certifications?: string[];
          languages?: string[];
          business_types?: string[];
          company_size?: string | null;
          incoterms?: string[];
          payment_terms?: string[];
          currencies?: string[];
          website?: string | null;
          description?: string | null;
          completed_at?: string | null;
          skipped_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          products?: string[];
          industry?: string | null;
          roles?: Database['public']['Enums']['trade_role'][];
          looking_for?: Database['public']['Enums']['trade_looking_for'] | null;
          countries?: string[];
          production_capacity?: string | null;
          moq?: string | null;
          certifications?: string[];
          languages?: string[];
          business_types?: string[];
          company_size?: string | null;
          incoterms?: string[];
          payment_terms?: string[];
          currencies?: string[];
          website?: string | null;
          description?: string | null;
          completed_at?: string | null;
          skipped_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trade_profiles_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: true;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      trade_opportunities: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          objective: Database['public']['Enums']['trade_objective'];
          product: string | null;
          category: string | null;
          target_markets: string[];
          min_order_quantity: string | null;
          target_price: string | null;
          incoterms: string[];
          required_certifications: string[];
          keywords: string[];
          exclude_keywords: string[];
          payment_terms: string[];
          currencies: string[];
          criteria: string | null;
          notes: string | null;
          status: Database['public']['Enums']['opportunity_status'];
          created_by: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
          last_opened_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          objective?: Database['public']['Enums']['trade_objective'];
          product?: string | null;
          category?: string | null;
          target_markets?: string[];
          min_order_quantity?: string | null;
          target_price?: string | null;
          incoterms?: string[];
          required_certifications?: string[];
          keywords?: string[];
          exclude_keywords?: string[];
          payment_terms?: string[];
          currencies?: string[];
          criteria?: string | null;
          notes?: string | null;
          status?: Database['public']['Enums']['opportunity_status'];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          last_opened_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          objective?: Database['public']['Enums']['trade_objective'];
          product?: string | null;
          category?: string | null;
          target_markets?: string[];
          min_order_quantity?: string | null;
          target_price?: string | null;
          incoterms?: string[];
          required_certifications?: string[];
          keywords?: string[];
          exclude_keywords?: string[];
          payment_terms?: string[];
          currencies?: string[];
          criteria?: string | null;
          notes?: string | null;
          status?: Database['public']['Enums']['opportunity_status'];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          last_opened_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trade_opportunities_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      trade_profile_documents: {
        Row: {
          id: string;
          organization_id: string;
          uploaded_by: string | null;
          file_name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          status: Database['public']['Enums']['document_analysis_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          uploaded_by?: string | null;
          file_name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: Database['public']['Enums']['document_analysis_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          uploaded_by?: string | null;
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: Database['public']['Enums']['document_analysis_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trade_profile_documents_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_documents: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string;
          kind: Database['public']['Enums']['opportunity_document_kind'];
          file_name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          status: Database['public']['Enums']['document_analysis_status'];
          extracted: Json | null;
          version: number;
          replaces_id: string | null;
          is_current: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id: string;
          kind?: Database['public']['Enums']['opportunity_document_kind'];
          file_name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: Database['public']['Enums']['document_analysis_status'];
          extracted?: Json | null;
          version?: number;
          replaces_id?: string | null;
          is_current?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string;
          kind?: Database['public']['Enums']['opportunity_document_kind'];
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: Database['public']['Enums']['document_analysis_status'];
          extracted?: Json | null;
          version?: number;
          replaces_id?: string | null;
          is_current?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunity_companies: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string;
          role: Database['public']['Enums']['opportunity_company_role'];
          name: string;
          country: string | null;
          website: string | null;
          fit_score: number | null;
          status: Database['public']['Enums']['opportunity_company_status'];
          source: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id: string;
          role: Database['public']['Enums']['opportunity_company_role'];
          name: string;
          country?: string | null;
          website?: string | null;
          fit_score?: number | null;
          status?: Database['public']['Enums']['opportunity_company_status'];
          source?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string;
          role?: Database['public']['Enums']['opportunity_company_role'];
          name?: string;
          country?: string | null;
          website?: string | null;
          fit_score?: number | null;
          status?: Database['public']['Enums']['opportunity_company_status'];
          source?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunity_messages: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string;
          company_id: string | null;
          direction: Database['public']['Enums']['opportunity_message_direction'];
          channel: string | null;
          subject: string | null;
          body: string;
          status: Database['public']['Enums']['message_status'];
          approved_by: string | null;
          approved_at: string | null;
          failed_reason: string | null;
          ai_generated: boolean;
          sent_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id: string;
          company_id?: string | null;
          direction: Database['public']['Enums']['opportunity_message_direction'];
          channel?: string | null;
          subject?: string | null;
          body: string;
          status?: Database['public']['Enums']['message_status'];
          approved_by?: string | null;
          approved_at?: string | null;
          failed_reason?: string | null;
          ai_generated?: boolean;
          sent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string;
          company_id?: string | null;
          direction?: Database['public']['Enums']['opportunity_message_direction'];
          channel?: string | null;
          subject?: string | null;
          body?: string;
          status?: Database['public']['Enums']['message_status'];
          approved_by?: string | null;
          approved_at?: string | null;
          failed_reason?: string | null;
          ai_generated?: boolean;
          sent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      outreach_audit_log: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string;
          company_id: string | null;
          message_id: string | null;
          channel: string | null;
          actor: string | null;
          event: Database['public']['Enums']['outreach_audit_event'];
          result: string | null;
          detail: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id: string;
          company_id?: string | null;
          message_id?: string | null;
          channel?: string | null;
          actor?: string | null;
          event: Database['public']['Enums']['outreach_audit_event'];
          result?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string;
          company_id?: string | null;
          message_id?: string | null;
          channel?: string | null;
          actor?: string | null;
          event?: Database['public']['Enums']['outreach_audit_event'];
          result?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      opportunity_timeline_events: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string;
          kind: string;
          title: string;
          detail: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id: string;
          kind: string;
          title: string;
          detail?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string;
          kind?: string;
          title?: string;
          detail?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
      trade_role: 'manufacturer' | 'exporter' | 'importer' | 'trader' | 'distributor';
      trade_looking_for: 'buyers' | 'suppliers' | 'both';
      document_analysis_status: 'pending' | 'processing' | 'analyzed' | 'failed';
      trade_objective: 'find_buyers' | 'find_suppliers' | 'both';
      opportunity_status: 'draft' | 'active' | 'archived';
      opportunity_document_kind:
        | 'loi'
        | 'rfq'
        | 'purchase_order'
        | 'product_spec'
        | 'company_profile'
        | 'product_catalog'
        | 'other';
      opportunity_company_role: 'buyer' | 'supplier';
      opportunity_company_status:
        | 'suggested'
        | 'shortlisted'
        | 'contacted'
        | 'qualified'
        | 'rejected';
      opportunity_message_direction: 'inbound' | 'outbound';
      message_status: 'draft' | 'approved' | 'sending' | 'sent' | 'failed';
      outreach_audit_event:
        | 'draft_created'
        | 'draft_regenerated'
        | 'draft_edited'
        | 'draft_approved'
        | 'message_send_attempted'
        | 'message_sent'
        | 'message_failed'
        | 'reply_received';
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
export type TradeProfileRow = Tables<'trade_profiles'>;
export type TradeProfileDocumentRow = Tables<'trade_profile_documents'>;
export type TradeOpportunityRow = Tables<'trade_opportunities'>;
export type OpportunityDocumentRow = Tables<'opportunity_documents'>;
export type OpportunityTimelineEventRow = Tables<'opportunity_timeline_events'>;
export type OpportunityCompanyRow = Tables<'opportunity_companies'>;
export type OpportunityMessageRow = Tables<'opportunity_messages'>;
export type OutreachAuditLogRow = Tables<'outreach_audit_log'>;
