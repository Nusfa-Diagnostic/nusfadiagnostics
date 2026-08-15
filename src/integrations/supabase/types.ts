export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          item_name: string
          item_type: string
          package_id: string | null
          price: number
          test_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          item_name: string
          item_type: string
          package_id?: string | null
          price?: number
          test_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          item_name?: string
          item_type?: string
          package_id?: string | null
          price?: number
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string | null
          admin_notes: string | null
          amount: number
          booking_number: string
          city: string | null
          collection_type: Database["public"]["Enums"]["collection_type"]
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          customer_id: string
          customer_notes: string | null
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pincode: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          amount?: number
          booking_number?: string
          city?: string | null
          collection_type?: Database["public"]["Enums"]["collection_type"]
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          amount?: number
          booking_number?: string
          city?: string | null
          collection_type?: Database["public"]["Enums"]["collection_type"]
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          coupon_code: string | null
          created_at: string
          description: string | null
          discount_text: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      package_tests: {
        Row: {
          created_at: string
          id: string
          package_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_tests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          benefits: string[]
          created_at: string
          description: string | null
          discount_percent: number | null
          faqs: Json
          id: string
          image_url: string | null
          includes: string[]
          is_active: boolean
          is_featured: boolean
          mrp: number | null
          name: string
          preparation: string | null
          price: number
          related_package_ids: string[]
          report_time: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          faqs?: Json
          id?: string
          image_url?: string | null
          includes?: string[]
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name: string
          preparation?: string | null
          price?: number
          related_package_ids?: string[]
          report_time?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          faqs?: Json
          id?: string
          image_url?: string | null
          includes?: string[]
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name?: string
          preparation?: string | null
          price?: number
          related_package_ids?: string[]
          report_time?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          customer_code: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          phone: string | null
          pincode: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_code?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          pincode?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_code?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          pincode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          booking_id: string | null
          created_at: string
          customer_id: string
          file_path: string
          file_size: number | null
          id: string
          is_published: boolean
          notes: string | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          customer_id: string
          file_path: string
          file_size?: number | null
          id?: string
          is_published?: boolean
          notes?: string | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          customer_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_published?: boolean
          notes?: string | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      test_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          message: string
          name: string
          rating: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          message: string
          name: string
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          message?: string
          name?: string
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tests: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discount_percent: number | null
          faqs: Json
          fasting_required: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          mrp: number | null
          name: string
          preparation: string | null
          price: number
          related_test_ids: string[]
          report_time: string | null
          sample_type: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
          why_required: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          faqs?: Json
          fasting_required?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name: string
          preparation?: string | null
          price?: number
          related_test_ids?: string[]
          report_time?: string | null
          sample_type?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          why_required?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          faqs?: Json
          fasting_required?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name?: string
          preparation?: string | null
          price?: number
          related_test_ids?: string[]
          report_time?: string | null
          sample_type?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          why_required?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "test_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      next_customer_code: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin"
      booking_status:
        | "new"
        | "confirmed"
        | "sample_collected"
        | "processing"
        | "report_ready"
        | "completed"
        | "cancelled"
      collection_type: "home_collection" | "lab_visit"
      payment_status: "pending" | "paid" | "refunded" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      booking_status: [
        "new",
        "confirmed",
        "sample_collected",
        "processing",
        "report_ready",
        "completed",
        "cancelled",
      ],
      collection_type: ["home_collection", "lab_visit"],
      payment_status: ["pending", "paid", "refunded", "failed"],
    },
  },
} as const
