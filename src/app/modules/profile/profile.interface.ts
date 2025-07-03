export interface TProfile {
  _id?: string;
  profilePicture?: string;
  name: string;
  designation: string;
  introduction: string;
  phone: string;
  email: string;
  address?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}
