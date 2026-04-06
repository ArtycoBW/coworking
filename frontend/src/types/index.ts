export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string | null;
  role: Role;
  rating: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  studentId?: string;
  password: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export type SpaceType = "DESK" | "MEETING_ROOM";
export type SpaceStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  status: SpaceStatus;
  capacity: number;
  description?: string | null;
  amenities: string[];
  posX: number;
  posY: number;
  posZ: number;
  createdAt: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export interface Booking {
  id: string;
  spaceId: string;
  space: Space;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
