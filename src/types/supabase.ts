export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          is_admin?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}