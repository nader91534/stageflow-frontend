export type UserRole = 'student' | 'company' | 'admin';
export type UserStatus = 'pending' | 'active' | 'rejected';
export type OfferStatus = 'pending' | 'active' | 'closed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  status: UserStatus;
  created_at: string;
}

export interface Offer {
  id: number;
  company_id: number;
  company_name?: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  duration: string;
  status: OfferStatus;
  created_at: string;
}

export interface Application {
  id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  offer_id: number;
  offer_title?: string;
  company_name?: string;
  cv_data: string;
  cover_letter: string;
  status: ApplicationStatus;
  feedback: string;
  rating: number;
  report_data: string;
  acceptance_document?: string;
  created_at: string;
}
