export interface Resume {
  id: number;
  user_id: number;
  cloudinary_url: string;
  extracted_data?: {
    filename?: string;
    text?: string;
  };
}

export interface UserProfile {
  resume_name?: string;
  resume?: Resume;
  jobRoles?: string[];
  jobTypes?: string[];
  locations?: string[];
  companies?: string[];
  name?: string;
  email?: string;
  mobile?: string;
}
